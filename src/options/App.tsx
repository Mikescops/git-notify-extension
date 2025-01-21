import * as browser from 'webextension-polyfill';
import { useState, useEffect } from 'react';
import { Box, Button, TextInput, Tooltip, Octicon, FormControl, Select, ThemeProvider } from '@primer/react';
import { InfoIcon, ClockIcon } from '@primer/octicons-react';
import './style.css';
import { Configuration, TabId } from '../common/types';
import { AccountConfiguration } from './components/Account';
import { getConfiguration, updateConfiguration, defaultEmptyAccount, clearAccountStorage } from '../common/storage';

const getSettings = getConfiguration(['accounts', 'refreshRate', 'defaultTab', 'alertBadgeCounters', 'mode']);

export const App = () => {
    const [configuration, setConfiguration] = useState<Configuration>();

    useEffect(() => {
        getSettings.then((settings) => {
            if (!settings) {
                return;
            }
            setConfiguration(settings);
        });
    }, []);

    const updateConfigurationInMemory = async (data: Partial<Configuration>) => {
        if (!configuration) {
            return;
        }
        setConfiguration({ ...configuration, ...data });
        await updateConfiguration(data);
        if (data.refreshRate) {
            await browser.runtime.sendMessage({ type: 'updateRefreshRate', interval: data.refreshRate });
        }
    };

    const addNewAccount = () =>
        updateConfigurationInMemory({
            accounts: [...(configuration?.accounts || []), defaultEmptyAccount()]
        });

    const removeAccount = (index: number) => {
        const accounts = configuration?.accounts || [];
        void clearAccountStorage(accounts[index].uuid);
        accounts.splice(index, 1);
        updateConfigurationInMemory({ accounts });
    };

    return (
        <ThemeProvider colorMode="auto">
            <Box display="grid" sx={{ width: 500, p: 2, pl: 4, pr: 6, bg: 'canvas.default', gap: 1 }}>
                <h2>Main Settings</h2>
                <Box
                    display="grid"
                    sx={{
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: 'border.default',
                        p: 3,
                        borderRadius: 2,
                        gap: 3
                    }}
                >
                    <FormControl>
                        <FormControl.Label>
                            Refresh rate in seconds{' '}
                            <Tooltip aria-label="It is not recommended to go below 30 seconds.">
                                <Octicon icon={InfoIcon} size={15} color="blue.5" />
                            </Tooltip>
                        </FormControl.Label>
                        <TextInput
                            leadingVisual={ClockIcon}
                            block
                            type="number"
                            name="refreshRate"
                            min="20"
                            value={configuration?.refreshRate}
                            placeholder="0"
                            onChange={(e) => updateConfigurationInMemory({ refreshRate: parseInt(e.target.value) })}
                            sx={{ boxSizing: 'border-box' }}
                        />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>Default tab on opening</FormControl.Label>
                        <Select
                            name="default-tab"
                            onChange={(e) => updateConfigurationInMemory({ defaultTab: e.target.value as TabId })}
                        >
                            <Select.Option selected={configuration?.defaultTab === 'to_review'} value="to_review">
                                To Review
                            </Select.Option>
                            <Select.Option selected={configuration?.defaultTab === 'under_review'} value="under_review">
                                Under Review
                            </Select.Option>
                            <Select.Option selected={configuration?.defaultTab === 'drafts'} value="drafts">
                                Drafts
                            </Select.Option>
                            <Select.Option selected={configuration?.defaultTab === 'issues'} value="issues">
                                Issues
                            </Select.Option>
                            <Select.Option selected={configuration?.defaultTab === 'todo_list'} value="todo_list">
                                To-Do List
                            </Select.Option>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>
                            Alert badge counters{' '}
                            <Tooltip aria-label="You can select multiple counters but display might be too small.">
                                <Octicon icon={InfoIcon} size={15} color="blue.5" />
                            </Tooltip>
                        </FormControl.Label>
                        <select
                            name="alert-badge-counters"
                            multiple
                            onChange={(event) => {
                                const options = [...event.target.selectedOptions].map((option) =>
                                    parseInt(option.value)
                                );
                                updateConfigurationInMemory({ alertBadgeCounters: options });
                            }}
                        >
                            <option selected={configuration?.alertBadgeCounters.includes(0)} value="0">
                                To Review
                            </option>
                            <option selected={configuration?.alertBadgeCounters.includes(1)} value="1">
                                Reviewed by others
                            </option>
                            <option selected={configuration?.alertBadgeCounters.includes(2)} value="2">
                                Issues
                            </option>
                            <option selected={configuration?.alertBadgeCounters.includes(3)} value="3">
                                To-Do List
                            </option>
                        </select>
                    </FormControl>
                </Box>
                <h2>Accounts</h2>
                {configuration?.accounts.map((account, index) => (
                    <AccountConfiguration
                        key={index}
                        accountIndex={index}
                        account={account}
                        removeAccount={() => removeAccount(index)}
                    />
                ))}
                <Button onClick={addNewAccount}>Add account</Button>
            </Box>
        </ThemeProvider>
    );
};
