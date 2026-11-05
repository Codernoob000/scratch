import React from 'react';
import { content, Project } from '../content/types';

export default function Projects(): React.ReactElement {
  const normalProjects = content.projects.filter((p) => !p.golden);
  const goldenProjects = content.projects.filter((p) => p.golden);
  const orderedProjects: Project[] = [...normalProjects, ...goldenProjects];

  return (
    <section id="projects" className="section" aria-labelledby="projects-heading">
      <div className="page-container">
        <h2 id="projects-heading" className="section-title">
          Projects
        </h2>
        <div className="projects-grid">
          {orderedProjects.map((project) => {
            const hasEvent = Boolean(project.event && project.event.trim().length > 0);
            const validLinks = project.links.filter((l) => l.url && l.url.trim().length > 0);

            return (
              <article
                key={project.id}
                className={`project-card${project.golden ? ' golden' : ''}`}
              >
                <div className="project-header-line">
                  <span className="project-meta">
                    {project.code}
                    {hasEvent ? ` · ${project.event}` : ''}
                  </span>
                  {project.golden && (
                    <span className="project-badge-shelved">The one I shelved</span>
                  )}
                </div>

                <h3 className="project-title">{project.title}</h3>

                <p className="project-what">{project.what}</p>

                <div className="project-wrong-block">
                  <div className="project-wrong-label">What went wrong</div>
                  <p className="project-wrong">{project.wrong}</p>
                </div>

                <div className="project-stack">{project.stack.join(', ')}</div>

                {validLinks.length > 0 && (
                  <div className="project-links">
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
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

