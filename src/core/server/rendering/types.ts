/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';
import type { ThemeVersion } from '@kbn/ui-shared-deps-npm';

import { InternalElasticsearchServiceSetup } from '../elasticsearch';
import { EnvironmentMode, PackageInfo } from '../config';
import { ICspConfig } from '../csp';
import { InternalHttpServicePreboot, InternalHttpServiceSetup, KibanaRequest } from '../http';
import { UiPlugins, DiscoveredPlugin } from '../plugins';
import { IUiSettingsClient, UserProvidedValues } from '../ui_settings';
import type { InternalStatusServiceSetup } from '../status';
import { IExternalUrlPolicy } from '../external_url';

/** @internal */
export interface RenderingMetadata {
  strictCsp: ICspConfig['strict'];
  uiPublicUrl: string;
  bootstrapScriptUrl: string;
  i18n: typeof i18n.translate;
  locale: string;
  darkMode: boolean;
  themeVersion: ThemeVersion;
  stylesheetPaths: string[];
  injectedMetadata: InjectedMetadata;
}

/** @internal */
export interface InjectedMetadata {
  version: string;
  buildNumber: number;
  branch: string;
  basePath: string;
  serverBasePath: string;
  publicBaseUrl?: string;
  clusterInfo: {
    cluster_uuid?: string;
    cluster_name?: string;
    cluster_version?: string;
  };
  env: {
    mode: EnvironmentMode;
    packageInfo: PackageInfo;
  };
  anonymousStatusPage: boolean;
  i18n: {
    translationsUrl: string;
  };
  theme: {
    darkMode: boolean;
    version: ThemeVersion;
  };
  csp: Pick<ICspConfig, 'warnLegacyBrowsers'>;
  externalUrl: { policy: IExternalUrlPolicy[] };
  vars: Record<string, any>;
  uiPlugins: Array<{
    id: string;
    plugin: DiscoveredPlugin;
    config?: Record<string, unknown>;
  }>;
  legacyMetadata: {
    uiSettings: {
      defaults: Record<string, any>;
      user: Record<string, UserProvidedValues<any>>;
    };
  };
}

/** @internal */
export interface RenderingPrebootDeps {
  http: InternalHttpServicePreboot;
  uiPlugins: UiPlugins;
}

/** @internal */
export interface RenderingSetupDeps {
  elasticsearch: InternalElasticsearchServiceSetup;
  http: InternalHttpServiceSetup;
  status: InternalStatusServiceSetup;
  uiPlugins: UiPlugins;
}

/** @public */
export interface IRenderOptions {
  /**
   * Set whether the page is anonymous, which determines what plugins are enabled and whether to output user settings in the page metadata.
   * `false` by default.
   */
  isAnonymousPage?: boolean;

  /**
   * Inject custom vars into the page metadata.
   * @deprecated for legacy use only. Can be removed when https://github.com/elastic/kibana/issues/127733 is done.
   * @internal
   */
  vars?: Record<string, any>;

  /**
   * @internal
   * This is only used for integration tests that allow us to verify which config keys are exposed to the browser.
   */
  includeExposedConfigKeys?: boolean;
}

/** @internal */
export interface InternalRenderingServiceSetup {
  /**
   * Generate a `KibanaResponse` which renders an HTML page bootstrapped
   * with the `core` bundle or the ID of another specified legacy bundle.
   *
   * @example
   * ```ts
   * const html = await rendering.render(request, uiSettings);
   * ```
   */
  render(
    request: KibanaRequest,
    uiSettings: IUiSettingsClient,
    options?: IRenderOptions
  ): Promise<string>;
}

/** @internal */
export type InternalRenderingServicePreboot = InternalRenderingServiceSetup;
