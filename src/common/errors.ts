export class GlobalError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class GitLabTokenNotSet extends GlobalError {
    constructor() {
        super('No GitLab token set, visit options.');
    }
}

export class GitLabAddressNotSet extends GlobalError {
    constructor() {
        super('No GitLab host address set, visit options.');
    }
}
