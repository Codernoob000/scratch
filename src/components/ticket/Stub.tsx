import React from 'react';
import { Project } from '../../content/types';

interface StubProps {
  project: Project | null;
  onClose?: () => void;
}

export default function Stub({ project, onClose }: StubProps): React.ReactElement | null {
  if (!project) return null;

  const hasEvent = Boolean(project.event && project.event.trim().length > 0);
  const validLinks = project.links.filter((l) => l.url && l.url.trim().length > 0);

  return (
    <aside className="ticket-stub" aria-label={`Project details for ${project.title}`}>
      <div className="stub-header-line">
        <span className="stub-meta">
          {project.code} · {project.title}
          {hasEvent ? ` · ${project.event}` : ''}
        </span>
        {onClose && (
          <button
            type="button"
            className="stub-close-button"
            onClick={onClose}
            aria-label="Close project stub"
          >
            Close
          </button>
        )}
      </div>

      <h3 className="stub-title">{project.title}</h3>

      <p className="stub-what">{project.what}</p>

      <div className="stub-wrong-block">
        <div className="stub-wrong-label">What went wrong</div>
        <p className="stub-wrong">{project.wrong}</p>
      </div>

      <div className="stub-stack">{project.stack.join(', ')}</div>

      {validLinks.length > 0 && (
        <div className="stub-links">
          {validLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </aside>
  );
}

