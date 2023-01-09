import * as browser from 'webextension-polyfill';
import { AlertIcon, ArrowRightIcon, LinkIcon } from '@primer/octicons-react';
import { ActionList, Avatar, Heading, PageLayout } from '@primer/react';
import { createNewTab } from '../utils/createNewTab';

export const Onboarding = () => {
    return (
        <PageLayout>
            <PageLayout.Content
                sx={{
                    margin: '40px 80px',
                    padding: '0 20px',
                    border: 'solid 1px',
                    borderColor: 'neutral.subtle',
                    borderTop: 'none',
                    borderBottom: 'none'
                }}
            >
                <Heading sx={{ fontSize: 4, mb: 2 }}>Welcome to GitLab Notify!</Heading>

                <ActionList>
                    <ActionList.Item
                        variant="danger"
                        sx={{ marginLeft: 0 }}
                        onClick={() => browser.runtime.openOptionsPage()}
                    >
                        <ActionList.LeadingVisual>
                            <AlertIcon />
                        </ActionList.LeadingVisual>
                        Go to the options to configure the extension
                        <ActionList.TrailingVisual>
                            <ArrowRightIcon />
                        </ActionList.TrailingVisual>
                    </ActionList.Item>
                    <ActionList.Item
                        sx={{ marginLeft: 0 }}
                        onClick={(event) => createNewTab(event, 'https://github.com/Mikescops/gitlab-notify-extension')}
                    >
                        <ActionList.LeadingVisual>
                            <LinkIcon />
                        </ActionList.LeadingVisual>
                        github.com/Mikescops/gitlab-notify-extension
                    </ActionList.Item>
                    <ActionList.Item
                        sx={{ marginLeft: 0 }}
                        onClick={(event) => createNewTab(event, 'https://me.pixelswap.fr/')}
                    >
                        <ActionList.LeadingVisual>
                            <Avatar src="https://avatars.githubusercontent.com/u/4266283?s=40&v=4" />
                        </ActionList.LeadingVisual>
                        Created by Corentin Mors
                    </ActionList.Item>
                </ActionList>
            </PageLayout.Content>
        </PageLayout>
    );
};
