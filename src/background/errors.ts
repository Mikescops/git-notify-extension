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

export class GitLabIsCE extends Error {
    constructor() {
        super('You are likely using GitLab CE.\nPlease check the box in the options.');
    }
}
