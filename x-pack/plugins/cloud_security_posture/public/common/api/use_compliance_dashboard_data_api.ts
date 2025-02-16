/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useQuery } from 'react-query';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import { ComplianceDashboardData } from '../../../common/types';
import { STATS_ROUTE_PATH } from '../../../common/constants';

const getStatsKey = 'csp_dashboard_stats';

export const useComplianceDashboardDataApi = () => {
  const { http } = useKibana().services;
  return useQuery([getStatsKey], () => http!.get<ComplianceDashboardData>(STATS_ROUTE_PATH));
};
