import emptyInbox from '../assets/empty_inbox.svg';
import './style.css';

export const EmptyItems = () => (
    <div className={'emptyContainer'}>
        <img src={emptyInbox} className={'emptyInbox'} />
    </div>
);
