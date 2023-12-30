module.exports = {
  forbidden: [
    {
      name: 'not-to-dev-dep',
      comment: 'don\'t depend on devDependencies',
      severity: 'error',
      from: {},
      to: { dependencyTypes: ['npm-dev'] }
    },
  ],
  options: {
    doNotFollow: 'node_modules',
    tsConfig: {
      fileName: './tsconfig.json',
    },
  },
};module.exports = {
  forbidden: [
    {
      name: 'not-to-dev-dep',
      comment: 'don\'t depend on devDependencies',
      severity: 'error',
      from: {},
      to: { dependencyTypes: ['npm-dev'] }
    },
  ],
  options: {
    doNotFollow: 'node_modules',
    exclude: {
      path: 'lodash|react|react-dom|@emotion',
      dynamic: true,
    },
    tsConfig: {
      fileName: './tsconfig.json',
    },
    reporterOptions: {
      dot: {
        collapsePattern: '^src/(infrastructure|application|domain)/.*',
        theme: {
          graph: {
            rankdir: 'LR',
            // ranksep: '1.0',  // 调整层级之间的间距
            // nodesep: '0.5',  // 调整同一层级中节点之间的间距
          },
          modules: [
            {
              criteria: { source: '^src/infrastructure' },
              attributes: { fillcolor: 'aquamarine' },
            },
            {
              criteria: { source: '^src/application' },
              attributes: { fillcolor: 'coral' },
            },
            {
              criteria: { source: '^src/domain' },
              attributes: { fillcolor: 'darkgoldenrod1' },
            },
          ],
        },
      },
    },
  },
};