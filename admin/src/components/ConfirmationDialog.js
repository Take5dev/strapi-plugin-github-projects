import React from "react";
import { Dialog, DialogBody, Stack, Flex, Typography, DialogFooter, Button } from '@strapi/design-system';
import { ExclamationMarkCircle, Trash } from '@strapi/icons';

const ConfirmationDialog = ({ isVisible, message, onClose, onConfirm }) => {
    return <Dialog onClose={onClose} title="Confirmation" isOpen={isVisible}>
        <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack spacing={2}>
                <Flex justifyContent="center">
                    <Typography id="confirm-description">{message}</Typography>
                </Flex>
            </Stack>
        </DialogBody>
        <DialogFooter startAction={<Button onClick={onClose} variant="tertiary">
            Cancel
        </Button>} endAction={<Button onClick={onConfirm} variant="danger-light" startIcon={<Trash />}>
            Confirm
        </Button>} />
    </Dialog>
};

export default ConfirmationDialog;