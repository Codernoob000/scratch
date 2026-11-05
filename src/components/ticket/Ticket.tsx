import React, { useState, useEffect } from 'react';
import { content, Project } from '../../content/types';
import { storage } from '../../lib/storage';
import Hint from './Hint';
import Panel from './Panel';
import Stub from './Stub';

const STORAGE_KEY = 'ticket.v1';

export default function Ticket(): React.ReactElement {
  const [revealed, setRevealed] = useState<Set<string>>(() => {
    const saved = storage.get<string[]>(STORAGE_KEY);
    return saved && Array.isArray(saved) ? new Set(saved) : new Set();
  });

  const [openStub, setOpenStub] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  const projects = content.projects;
  const unlockAfter = content.ticket.unlockAfter;

  const normalRevealedCount = projects.filter(
    (p) => !p.golden && revealed.has(p.id)
  ).length;

  const isUnlocked = normalRevealedCount >= unlockAfter;

  // Track unlock transition for announcement
  const [wasUnlocked, setWasUnlocked] = useState(isUnlocked);
  useEffect(() => {
    if (isUnlocked && !wasUnlocked) {
      setAnnouncement('Locked panel unlocked');
      setWasUnlocked(true);
    }
  }, [isUnlocked, wasUnlocked]);

  // Sync to storage
  const handleReveal = (id: string) => {
    setRevealed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      storage.set(STORAGE_KEY, Array.from(next));

      const proj = projects.find((p) => p.id === id);
      if (proj) {
        setAnnouncement(`Revealed: ${proj.title}`);
      }
      return next;
    });
  };

  const handleSelect = (id: string) => {
    setOpenStub((prev) => (prev === id ? id : id));
  };

  const handleRevealAll = () => {
    const allIds = new Set(projects.map((p) => p.id));
    setRevealed(allIds);
    setOpenStub(null);
    storage.set(STORAGE_KEY, Array.from(allIds));
    setAnnouncement('All panels revealed');
  };

  const selectedProject: Project | null = openStub
    ? projects.find((p) => p.id === openStub) || null
    : null;

  return (
    <div className="ticket-wrapper">
      <Hint
        revealedCount={revealed.size}
        totalCount={projects.length}
        hintText={content.ticket.hint}
      />

      <div
        className="ticket-container"
        role="region"
        aria-label="Interactive scratch ticket"
      >
        {/* Ticket Header */}
        <div className="ticket-header">
          <div className="ticket-header-left">
            <span className="ticket-admit">ADMIT ONE</span>
            <span className="ticket-stamp">SCRATCH</span>
          </div>
          <span className="ticket-season">{content.ticket.title}</span>
          <span className="ticket-serial">{content.ticket.serial}</span>
        </div>

        {/* Perforation Line */}
        <div className="ticket-perforation" aria-hidden="true">
          <div className="ticket-notch notch-left" />
          <div className="perforation-dashed" />
          <div className="ticket-notch notch-right" />
        </div>

        {/* Panels Grid */}
        <div className="ticket-grid">
          {projects.map((project) => {
            const isGolden = Boolean(project.golden);
            const isLocked = isGolden && !isUnlocked;
            const isRevealed = revealed.has(project.id);
            const isSelected = openStub === project.id;
            const lockProgressText = `scratch ${unlockAfter} first · ${normalRevealedCount} of ${unlockAfter}`;

            return (
              <Panel
                key={project.id}
                project={project}
                isRevealed={isRevealed}
                isLocked={isLocked}
                lockProgressText={lockProgressText}
                isSelected={isSelected}
                onSelect={handleSelect}
                onReveal={handleReveal}
              />
            );
          })}
        </div>

        {/* Ticket Footer */}
        <div className="ticket-footer">
          <span className="ticket-counter">
            {revealed.size} of {projects.length} revealed
          </span>
          <button
            type="button"
            className="ticket-reveal-all-btn"
            onClick={handleRevealAll}
          >
            Reveal all
          </button>
        </div>
      </div>

      {/* Screen reader live announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Project Stub Details */}
      <Stub project={selectedProject} onClose={() => setOpenStub(null)} />
    </div>
  );
}
