/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isArray, isEmpty, xor, map } from 'lodash';
import uuid from 'uuid';
import { produce } from 'immer';

import { useMemo } from 'react';
import { convertECSMappingToObject } from '../../../common/schemas/common/utils';
import { FormConfig, useForm } from '../../shared_imports';
import { createFormSchema } from './schema';

const FORM_ID = 'editQueryFlyoutForm';

export interface UsePackQueryFormProps {
  uniqueQueryIds: string[];
  defaultValue?: PackFormData | undefined;
  handleSubmit: FormConfig<PackFormData, PackFormData>['onSubmit'];
}

export interface PackSOFormData {
  id: string;
  query: string;
  interval: number;
  platform?: string | undefined;
  version?: string | undefined;
  ecs_mapping?: Array<{ field: string; value: string }> | undefined;
}

export interface PackFormData {
  id: string;
  query: string;
  interval: number;
  platform?: string | undefined;
  version?: string | undefined;
  ecs_mapping?:
    | Array<
        Record<
          string,
          {
            field?: string;
            value?: string;
          }
        >
      >
    | undefined;
}

export const usePackQueryForm = ({
  uniqueQueryIds,
  defaultValue,
  handleSubmit,
}: UsePackQueryFormProps) => {
  const idSet = useMemo<Set<string>>(
    () => new Set<string>(xor(uniqueQueryIds, defaultValue?.id ? [defaultValue.id] : [])),
    [uniqueQueryIds, defaultValue]
  );
  const formSchema = useMemo<ReturnType<typeof createFormSchema>>(
    () => createFormSchema(idSet),
    [idSet]
  );

  return useForm<PackSOFormData, PackFormData>({
    id: FORM_ID + uuid.v4(),
    onSubmit: async (formData, isValid) => {
      if (isValid && handleSubmit) {
        // @ts-expect-error update types
        return handleSubmit(formData, isValid);
      }
    },
    options: {
      stripEmptyFields: true,
    },
    // @ts-expect-error update types
    defaultValue: defaultValue || {
      id: '',
      query: '',
      interval: 3600,
      ecs_mapping: [],
    },
    // @ts-expect-error update types
    serializer: (payload) =>
      produce(payload, (draft) => {
        if (isArray(draft.platform)) {
          draft.platform.join(',');
        }

        if (draft.platform?.split(',').length === 3) {
          // if all platforms are checked then use undefined
          delete draft.platform;
        }

        if (isArray(draft.version)) {
          if (!draft.version.length) {
            delete draft.version;
          } else {
            draft.version = draft.version[0];
          }
        }

        if (isEmpty(draft.ecs_mapping)) {
          delete draft.ecs_mapping;
        } else {
          // @ts-expect-error update types
          draft.ecs_mapping = convertECSMappingToObject(payload.ecs_mapping);
        }

        return draft;
      }),
    // @ts-expect-error update types
    deserializer: (payload) => {
      if (!payload) return {} as PackFormData;

      return {
        id: payload.id,
        query: payload.query,
        interval: payload.interval,
        platform: payload.platform,
        version: payload.version ? [payload.version] : [],
        ecs_mapping: !isArray(payload.ecs_mapping)
          ? map(payload.ecs_mapping, (value, key) => ({
              key,
              result: {
                // @ts-expect-error update types
                type: Object.keys(value)[0],
                // @ts-expect-error update types
                value: Object.values(value)[0],
              },
            }))
          : payload.ecs_mapping,
      };
    },
    // @ts-expect-error update types
    schema: formSchema,
  });
};
