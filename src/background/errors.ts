import { GlobalError } from '../common/errors';

export class FailFetchSettings extends GlobalError {
    constructor() {
        super('Fail fetching settings.');
    }
}

export class GitLabIsCE extends GlobalError {
    constructor() {
        super('You are likely using GitLab CE.\nPlease check the box in the options.');
    }
}
