export class FailFetchSettings extends Error {
    constructor() {
        super('Fail fetching settings.');
    }
}

export class GitLabTokenNotSet extends Error {
    constructor() {
        super('No GitLab token set, visit options.');
    }
}

export class GitLabAddressNotSet extends Error {
    constructor() {
        super('No GitLab host address set, visit options.');
    }
}

export class FailFetchMergeRequestsAssigned extends Error {
    constructor() {
        super('Could not fetch merge requests assigned.');
    }
}

export class FailFetchMergeRequestsGiven extends Error {
    constructor() {
        super('Could not fetch merge requests given.');
    }
}

export class FailFetchIssues extends Error {
    constructor() {
        super('Could not fetch issues.');
    }
}

export class FailFetchTodos extends Error {
    constructor() {
        super('Could not fetch todo list.');
    }
}
