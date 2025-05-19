import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/game/create',
    pathMatch: 'full'
  },
  {
    path: 'game',
    children: [
      {
        path: 'create',
        loadComponent: () =>
          import('./features/game-creation/components/game-creation.component')
            .then(m => m.GameCreationComponent),
        title: 'Create Game - Planning Poker'
      },
      {
        path: 'session/:sessionId',
        loadComponent: () =>
          import('./features/main-game/components/main-game.component')
            .then(m => m.MainGameComponent),
        title: 'Game Session - Planning Poker'
      },
      {
        path: 'join/:sessionId',
        loadComponent: () =>
          import('./features/main-game/components/main-game.component')
            .then(m => m.MainGameComponent),
        title: 'Join Game - Planning Poker'
      }
    ]
  },
  {
    path: 'issues',
    children: [
      {
        path: 'import',
        loadComponent: () =>
          import('./features/issue-management/components/issue-import.component')
            .then(m => m.IssueImportComponent),
        title: 'Import Issues - Planning Poker'
      },
      {
        path: 'manage',
        loadComponent: () =>
          import('./features/issue-management/components/issue-management.component')
            .then(m => m.IssueManagementComponent),
        title: 'Manage Issues - Planning Poker'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/game/create'
  }
];

export const gameGuards = {
  sessionExists: () => {
    return true;
  },

  isHost: () => {
    return true;
  }
};
