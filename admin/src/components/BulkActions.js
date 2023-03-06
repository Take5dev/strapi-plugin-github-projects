import React, { useState } from "react";
import { Box, Flex, Typography, Button } from '@strapi/design-system';
import ConfirmationDialog from "./ConfirmationDialog";

const BulkActions = ({ selectedRepos, bulkCreateAction, bulkDeleteAction }) => {
    const reposWithoutProject = selectedRepos.filter(repo => !repo.projectId);
    const reposWithProject = selectedRepos.filter(repo => repo.projectId);
    const projectsToBeCreated = reposWithoutProject.length;
    const projectsToBeDeleted = reposWithProject.length;
    const projectIdsToDelete = reposWithProject.map(repo => repo.projectId);
    const [dialogVisible, setDialogVisible] = useState(false);
    return <Box background="primary200" padding={2} marginBottom={4} hasRadius={true} shadow="filterShadow">
        <Flex>
            <Typography>{`You have ${projectsToBeCreated} projects to generate and ${projectsToBeDeleted} to delete`}</Typography>
            {projectsToBeCreated > 0 && <Box paddingLeft={2}>
                <Button onClick={() => bulkCreateAction(reposWithoutProject)} size="S" variant="success-light">Create {projectsToBeCreated} projects</Button>
            </Box>}
            {projectsToBeDeleted > 0 && <Box paddingLeft={2}>
                <Button size="S" variant="danger-light" onClick={() => setDialogVisible(true)}>Delete {projectsToBeDeleted} projects</Button>
            </Box>}
        </Flex>
        <ConfirmationDialog
            isVisible={dialogVisible}
            message="Are you sure you want to delete these projects?"
            onClose={() => setDialogVisible(false)}
            onConfirm={() => {
                bulkDeleteAction(projectIdsToDelete);
                setDialogVisible(false);
            }}
        />
    </Box>
};

export default BulkActions;