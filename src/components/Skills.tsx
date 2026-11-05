import React from 'react';
import { content } from '../content/types';

export default function Skills(): React.ReactElement {
  return (
    <section id="skills" className="section" aria-labelledby="skills-heading">
      <div className="page-container">
        <h2 id="skills-heading" className="section-title">
          Skills
        </h2>
        <div className="skills-grid">
          {content.skills.map((skillGroup) => (
            <div key={skillGroup.group} className="skill-group">
              <span className="skill-group-name">{skillGroup.group}</span>
              <p className="skill-items">{skillGroup.items.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

