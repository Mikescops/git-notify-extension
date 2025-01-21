export class GlobalError extends Error {
    constructor(
        readonly name: string,
        message: string
    ) {
        super(message);
    }
}

export class GitLabTokenNotSet extends GlobalError {
    constructor() {
        super('GitLabTokenNotSet', 'No GitLab token set, visit options.');
    }
}

export class GitLabAddressNotSet extends GlobalError {
    constructor() {
        super('GitLabAddressNotSet', 'No GitLab host address set, visit options.');
    }
}

export class FailFetchSettings extends GlobalError {
    constructor() {
        super('FailFetchSettings', 'Fail fetching settings.');
    }
}

export class GitLabIsCE extends GlobalError {
    constructor() {
        super('GitLabIsCE', 'You are likely using GitLab CE.\nPlease check the box in the options.');
    }
}

export class GitLabNoAccount extends GlobalError {
    constructor() {
        super('GitLabNoAccount', 'No account were configured.');
    }
}
