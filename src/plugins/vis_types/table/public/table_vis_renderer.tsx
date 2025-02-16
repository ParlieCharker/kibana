/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { lazy } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { CoreStart } from '@kbn/core/public';
import { VisualizationContainer } from '@kbn/visualizations-plugin/public';
import { ExpressionRenderDefinition } from '@kbn/expressions-plugin/common/expression_renderers';
import { KibanaThemeProvider } from '@kbn/kibana-react-plugin/public';
import { TableVisRenderValue } from './table_vis_fn';

const TableVisualizationComponent = lazy(() => import('./components/table_visualization'));

export const getTableVisRenderer: (
  core: CoreStart
) => ExpressionRenderDefinition<TableVisRenderValue> = (core) => ({
  name: 'table_vis',
  reuseDomNode: true,
  render: async (domNode, { visData, visConfig }, handlers) => {
    handlers.onDestroy(() => {
      unmountComponentAtNode(domNode);
    });

    const showNoResult =
      visData.table?.rows.length === 0 || (!visData.table && visData.tables.length === 0);

    render(
      <KibanaThemeProvider theme$={core.theme.theme$}>
        <VisualizationContainer
          data-test-subj="tbvChartContainer"
          handlers={handlers}
          showNoResult={showNoResult}
        >
          <TableVisualizationComponent
            core={core}
            handlers={handlers}
            visData={visData}
            visConfig={visConfig}
          />
        </VisualizationContainer>
      </KibanaThemeProvider>,
      domNode
    );
  },
});
