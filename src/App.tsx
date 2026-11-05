import React from 'react';
import { content } from './content/types';

export default function App(): React.ReactElement {
  return (
    <main>
      <h1>{content.person.name}</h1>
    </main>
  );
}

