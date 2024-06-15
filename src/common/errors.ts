export class GlobalError extends Error {
    constructor(
        readonly name: string,
        message: string
    ) {
        super(message);
    }
}

export class NoAccountSet extends GlobalError {
    constructor() {
        super('NoAccountSet', 'No account set, visit options.');
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
