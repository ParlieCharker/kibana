/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { takeUntil } from 'rxjs/operators';
import { from } from 'rxjs';
import type { Embeddable } from '@kbn/lens-plugin/public';
import type { CoreStart } from '@kbn/core/public';
import type { SharePluginStart } from '@kbn/share-plugin/public';
import type { DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { LensPublicStart } from '@kbn/lens-plugin/public';

import {
  toMountPoint,
  wrapWithTheme,
  KibanaContextProvider,
} from '@kbn/kibana-react-plugin/public';
import { DashboardConstants } from '@kbn/dashboard-plugin/public';
import { getMlGlobalServices } from '../../application/app';
import { LensLayerSelectionFlyout } from './lens_vis_layer_selection_flyout';

export async function showLensVisToADJobFlyout(
  embeddable: Embeddable,
  coreStart: CoreStart,
  share: SharePluginStart,
  data: DataPublicPluginStart,
  lens: LensPublicStart
): Promise<void> {
  const {
    http,
    theme: { theme$ },
    overlays,
    application: { currentAppId$ },
  } = coreStart;

  return new Promise(async (resolve, reject) => {
    try {
      const onFlyoutClose = () => {
        flyoutSession.close();
        resolve();
      };

      const flyoutSession = overlays.openFlyout(
        toMountPoint(
          wrapWithTheme(
            <KibanaContextProvider
              services={{ ...coreStart, mlServices: getMlGlobalServices(http) }}
            >
              <LensLayerSelectionFlyout
                embeddable={embeddable}
                onClose={() => {
                  onFlyoutClose();
                  resolve();
                }}
                data={data}
                share={share}
                lens={lens}
              />
            </KibanaContextProvider>,
            theme$
          )
        ),
        {
          'data-test-subj': 'mlFlyoutJobSelector',
          ownFocus: true,
          closeButtonAriaLabel: 'jobSelectorFlyout',
          onClose: onFlyoutClose,
          // @ts-expect-error should take any number/string compatible with the CSS width attribute
          size: '35vw',
        }
      );

      // Close the flyout when user navigates out of the dashboard plugin
      currentAppId$.pipe(takeUntil(from(flyoutSession.onClose))).subscribe((appId) => {
        if (appId !== DashboardConstants.DASHBOARDS_ID) {
          flyoutSession.close();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
