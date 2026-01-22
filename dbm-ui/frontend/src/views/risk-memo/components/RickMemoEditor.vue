<template>
  <DbEditor
    v-model="editorHtml"
    :edit-mode="mode"
    :placeholder="placeholder"
    :upload-image-config="uploadImageConfig" />
</template>
<script setup lang="ts">
  import DbEditor from '@components/db-editor/Index.vue';

  interface Props {
    mode?: 'default' | 'viewer';
    placeholder?: string;
  }

  withDefaults(defineProps<Props>(), {
    mode: 'default',
    placeholder: undefined,
  });

  const editorHtml = defineModel<string>({
    default: '',
  });

  const uploadImageConfig = {
    fieldName: 'file',
    meta: {
      bk_biz_id: window.PROJECT_CONFIG.BIZ_ID,
    },
    server: '/apis/risk_memo/images/',
  };
</script>
