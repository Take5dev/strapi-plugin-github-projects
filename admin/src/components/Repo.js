import React, { useEffect, useState } from "react";
import { auth } from '@strapi/helper-plugin';
import axios from 'axios';
import { Alert, Loader, Box, Flex, IconButton, Typography, BaseCheckbox, VisuallyHidden, Link, Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system';
import { Pencil, Plus, Trash } from '@strapi/icons';
import ConfirmationDialog from "./ConfirmationDialog";
import BulkActions from "./BulkActions";
import { useIntl } from 'react-intl';
import getTrad from "../utils/getTrad";

const COL_COUNT = 5;

const Repo = (props) => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRepos, setSelectedRepos] = useState([]);
    const [alert, setAlert] = useState(undefined);
    const [deletingProject, setDeletingProject] = useState(undefined);
    const { formatMessage } = useIntl();

    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${auth.getToken()}`,
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    };

    const showAlert = (alert) => {
        setAlert(alert);
        setTimeout(function () {
            setAlert(undefined);
        }, 5000);
    }

    const createProject = (repo) => {
        axios.post(`${process.env.STRAPI_ADMIN_BACKEND_URL}/github-projects/project`, repo, axiosConfig).then(response => {
            setRepos(prevState => prevState.map(item => item.id !== repo.id ? item : {
                ...item,
                projectId: response.data.id
            }));
            showAlert({
                title: "Project created",
                message: `Successfully created project ${response.data.title}`,
                variant: "success"
            });
        }).catch(error => {
            showAlert({
                title: "Error creating a Project",
                message: `Error creating a Project for ${repo.name}: ${error.toString()}`,
                variant: "danger"
            });
        });
    };

    const deleteProject = (repo) => {
        setDeletingProject(undefined);
        const { projectId } = repo;
        axios.delete(`${process.env.STRAPI_ADMIN_BACKEND_URL}/github-projects/project/${projectId}`, axiosConfig).then(response => {
            setRepos(prevState => prevState.map(item => item.id !== repo.id ? item : {
                ...item,
                projectId: null
            }));
            showAlert({
                title: "Project deleted",
                message: `Successfully deleted project ${response.data.title}`,
                variant: "success"
            });
        }).catch(error => {
            showAlert({
                title: "Error deleting a Project",
                message: `Error deleting a Project for ${repo.name}: ${error.toString()}`,
                variant: "danger"
            });
        });
    };

    const createMany = (reposToBecomeProjects) => {
        axios.post(`${process.env.STRAPI_ADMIN_BACKEND_URL}/github-projects/projects`, { repos: reposToBecomeProjects }, axiosConfig).then(response => {
            if (response.data.length === reposToBecomeProjects.length) {
                setRepos(prevState => {
                    const newState = prevState.map(repo => {
                        const relatedProjectCreated = response.data.find(project => project.repositoryId === `${repo.id}`);
                        return !repo.projectId && relatedProjectCreated ? {
                            ...repo,
                            projectId: relatedProjectCreated.id
                        } : repo
                    });
                    return newState;
                });
                showAlert({
                    title: `Projects created`,
                    message: `Successfully created ${reposToBecomeProjects.length} projects`,
                    variant: "success"
                });
            }
            else {
                showAlert({
                    title: "Error creating Projects",
                    message: `Error creating some projects`,
                    variant: "danger"
                });
            }
        }).catch(error => {
            showAlert({
                title: "Error creating Projects",
                message: `Error creating some projects: ${error.toString()}`,
                variant: "danger"
            });
        }).finally(() => setSelectedRepos([]));
    };

    const deleteMany = (projectIds) => {
        axios.delete(`${process.env.STRAPI_ADMIN_BACKEND_URL}/github-projects/projects`, {
            ...axiosConfig,
            params: {
                projectIds
            }
        }).then(response => {
            if (response.data.length === projectIds.length) {
                setRepos(prevState => {
                    const newState = prevState.map(repo => {
                        const relatedProjectDeleted = response.data.find(project => project.repositoryId === `${repo.id}`);
                        return repo.projectId && relatedProjectDeleted ? {
                            ...repo,
                            projectId: null
                        } : repo
                    });
                    return newState;
                });
                showAlert({
                    title: `Projects deleted`,
                    message: `Successfully created ${projectIds.length} projects`,
                    variant: "success"
                });
            }
            else {
                showAlert({
                    title: "Error deleting Projects",
                    message: `Error deleting some projects`,
                    variant: "danger"
                });
            }
        }).catch(error => {
            showAlert({
                title: "Error deleting Projects",
                message: `Error deleting some projects: ${error.toString()}`,
                variant: "danger"
            });
        }).finally(() => setSelectedRepos([]));
    };

    useEffect(async () => {
        setLoading(true);
        axios.get(`${process.env.STRAPI_ADMIN_BACKEND_URL}/github-projects/repos`, axiosConfig).then(response => {
            setRepos(response.data);
            setLoading(false);
        }).catch((error) => {
            showAlert({
                title: "Error fetching repositories",
                message: error.toString(),
                variant: "danger"
            });
            setLoading(false);
        });

    }, []);

    if (loading) return <Loader />

    const allChecked = repos.length === selectedRepos.length;
    const isIndeterminate = selectedRepos.length > 0 && !allChecked;

    return <Box padding={8} background="neutral100">
        {deletingProject && <ConfirmationDialog
            isVisible={!!deletingProject}
            message="Are you sure you want to delete this project?"
            onClose={() => setDeletingProject(undefined)}
            onConfirm={() => deleteProject(deletingProject)}
        />}
        {selectedRepos.length > 0 && <BulkActions selectedRepos={selectedRepos.map(repoId => repos.find(repo => repo.id === repoId))} bulkCreateAction={createMany} bulkDeleteAction={deleteMany} />}
        <Table colCount={COL_COUNT} rowCount={repos.length}>
            {alert && <div style={{ position: "absolute", top: 0, left: "14%", zIndex: 10 }}>
                <Alert closeLabel="Close alert" title={alert.title} variant={alert.variant}>{alert.message}</Alert>
            </div>}
            <Thead>
                <Tr>
                    <Th>
                        <BaseCheckbox
                            aria-label="Select all entries"
                            indeterminate={isIndeterminate}
                            value={allChecked}
                            onValueChange={value => value ? setSelectedRepos(repos.map(repo => repo.id)) : setSelectedRepos([])}
                        />
                    </Th>
                    <Th>
                        <Typography variant="sigma">{formatMessage({
                            id: getTrad("repo.name"),
                            defaultMessage: "Name"
                        })}</Typography>
                    </Th>
                    <Th>
                        <Typography variant="sigma">{formatMessage({
                            id: getTrad("repo.description"),
                            defaultMessage: "Description"
                        })}</Typography>
                    </Th>
                    <Th>
                        <Typography variant="sigma">{formatMessage({
                            id: getTrad("repo.url"),
                            defaultMessage: "URL"
                        })}</Typography>
                    </Th>
                    <Th>
                        <VisuallyHidden>{formatMessage({
                            id: getTrad("repo.actions"),
                            defaultMessage: "Actions"
                        })}</VisuallyHidden>
                    </Th>
                </Tr>
            </Thead>
            <Tbody>
                {repos.map(repo => {
                    const { id, name, shortDesciption, url, projectId } = repo;
                    return <Tr key={id}>
                        <Td>
                            <BaseCheckbox
                                aria-label={`Select ${id}`}
                                value={selectedRepos.includes(id)}
                                onValueChange={value => {
                                    setSelectedRepos(prevState => value ? [...prevState, id] : prevState.filter(item => item !== id));
                                }}
                            />
                        </Td>
                        <Td>
                            <Typography textColor="neutral800">{name}</Typography>
                        </Td>
                        <Td>
                            <Typography textColor="neutral800">{shortDesciption}</Typography>
                        </Td>
                        <Td>
                            <Typography textColor="neutral800">
                                <Link href={url} isExternal={true}>{url}</Link>
                            </Typography>
                        </Td>
                        <Td>
                            {projectId ? <Flex>
                                <Link to={`/content-manager/collectionType/plugin::github-projects.project/${projectId}`}>
                                    <IconButton onClick={() => console.log('edit')} label="Edit" noBorder icon={<Pencil />} />
                                </Link>
                                <Box paddingLeft={1}>
                                    <IconButton onClick={() => setDeletingProject(repo)} label="Delete" noBorder icon={<Trash />} />
                                </Box>
                            </Flex> : <IconButton onClick={() => createProject(repo)} label="Add" noBorder icon={<Plus />} />}
                        </Td>
                    </Tr>
                })}
            </Tbody>
        </Table>
    </Box >
};

export default Repo;