import { useState } from 'react';
import { FeedIcon } from '../home/FeedIcon';

/** ⋯ button with a one-item menu; deleting is the only action a written post supports. */
export function PostMenu({ label, onDelete }: { label: string; onDelete: () => void }) {
    const [open, setOpen] = useState(false);
    return <div className="post-menu" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
        <button type="button" aria-label={`${label} 더 보기`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}><FeedIcon name="more" /></button>
        {open && <div className="post-menu-panel" role="menu">
            <button type="button" role="menuitem" onClick={() => { setOpen(false); if (window.confirm('게시글을 삭제할까요?')) onDelete(); }}>삭제하기</button>
        </div>}
    </div>;
}
