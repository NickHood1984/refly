import { useEffect, useRef, FC, useState, useCallback, memo } from 'react';
import { Button, Divider, Tooltip, Input, Modal, Skeleton } from 'antd';
import { useSiderStore, useSiderStoreShallow } from '@refly-packages/ai-workspace-common/stores/sider';
import { useTranslation } from 'react-i18next';
import { LOCALE } from '@refly/common-types';
import { useDebounce } from 'use-debounce';

import { MdOutlineImage, MdOutlineAspectRatio } from 'react-icons/md';
import { AiOutlineMenuUnfold } from 'react-icons/ai';
import { IconEdit } from '@refly-packages/ai-workspace-common/components/common/icon';
import SiderPopover from '../../../../../../apps/web/src/pages/sider-popover';
import { useCanvasStoreShallow } from '@refly-packages/ai-workspace-common/stores/canvas';
import { Helmet } from 'react-helmet';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';
import { time } from '@refly-packages/ai-workspace-common/utils/time';
import { ActionDropdown } from './action-dropdown';
import { useCanvasSync } from '@refly-packages/ai-workspace-common/hooks/canvas/use-canvas-sync';

interface TopToolbarProps {
  canvasId: string;
}

const CanvasTitle = memo(
  ({
    canvasId,
    canvasTitle,
    hasCanvasSynced,
    debouncedUnsyncedChanges,
    language,
  }: {
    canvasId: string;
    canvasTitle?: string;
    hasCanvasSynced: boolean;
    debouncedUnsyncedChanges: number;
    language: LOCALE;
  }) => {
    const { t } = useTranslation();
    const [editedTitle, setEditedTitle] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const inputRef = useRef(null);
    const { syncTitleToYDoc } = useCanvasSync();
    const { updateCanvasTitle } = useSiderStoreShallow((state) => ({
      updateCanvasTitle: state.updateCanvasTitle,
    }));

    const handleEditClick = () => {
      setEditedTitle(canvasTitle ?? '');
      setIsModalOpen(true);
    };

    const handleModalOk = () => {
      if (editedTitle?.trim()) {
        syncTitleToYDoc(editedTitle);
        updateCanvasTitle(canvasId, editedTitle);
        setIsModalOpen(false);
      }
    };

    const handleModalCancel = () => {
      setIsModalOpen(false);
    };

    return (
      <>
        <div
          className="ml-1 group flex items-center gap-2 text-sm font-bold text-gray-500 cursor-pointer hover:text-gray-700"
          onClick={handleEditClick}
        >
          <Tooltip
            title={
              debouncedUnsyncedChanges > 0
                ? t('canvas.toolbar.syncingChanges')
                : t('canvas.toolbar.synced', { time: time(new Date(), language)?.utc()?.fromNow() })
            }
          >
            <div
              className={`
              relative w-2.5 h-2.5 rounded-full
              transition-colors duration-700 ease-in-out
              ${debouncedUnsyncedChanges > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-green-400'}
            `}
            />
          </Tooltip>
          {!hasCanvasSynced ? (
            <Skeleton className="w-28" active paragraph={false} />
          ) : (
            canvasTitle || t('common.untitled')
          )}
          <IconEdit className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <Modal
          centered
          title={t('canvas.toolbar.editTitle')}
          open={isModalOpen}
          okText={t('common.confirm')}
          cancelText={t('common.cancel')}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okButtonProps={{ disabled: !editedTitle?.trim() }}
          afterOpenChange={(open) => {
            if (open) {
              inputRef.current?.focus();
            }
          }}
        >
          <Input
            autoFocus
            ref={inputRef}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder={t('canvas.toolbar.editTitlePlaceholder')}
            onKeyDown={(e) => {
              if (e.keyCode === 13 && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (editedTitle?.trim()) {
                  handleModalOk();
                }
              }
            }}
          />
        </Modal>
      </>
    );
  },
);

const ToolbarButtons = memo(
  ({
    showPreview,
    showMaxRatio,
    setShowPreview,
    setShowMaxRatio,
  }: {
    showPreview: boolean;
    showMaxRatio: boolean;
    setShowPreview: (show: boolean) => void;
    setShowMaxRatio: (show: boolean) => void;
  }) => {
    const { t } = useTranslation();

    return (
      <div className="flex items-center h-9 bg-[#ffffff] rounded-lg px-2 border border-solid border-1 border-[#EAECF0] box-shadow-[0px_2px_6px_0px_rgba(0,0,0,0.1)]">
        <Tooltip title={t(`canvas.toolbar.${showPreview ? 'hidePreview' : 'showPreview'}`)} destroyTooltipOnHide>
          <Button
            type="text"
            icon={<MdOutlineImage style={{ color: showPreview ? '#000' : '#9CA3AF' }} />}
            onClick={() => setShowPreview(!showPreview)}
            className="w-8 h-6 flex items-center justify-center mr-1"
          />
        </Tooltip>
        <Tooltip title={t(`canvas.toolbar.${showMaxRatio ? 'hideMaxRatio' : 'showMaxRatio'}`)} destroyTooltipOnHide>
          <Button
            type="text"
            icon={<MdOutlineAspectRatio style={{ color: showMaxRatio ? '#000' : '#9CA3AF' }} />}
            onClick={() => setShowMaxRatio(!showMaxRatio)}
            className="w-8 h-6 flex items-center justify-center"
          />
        </Tooltip>
      </div>
    );
  },
);

export const TopToolbar: FC<TopToolbarProps> = memo(({ canvasId }) => {
  const { i18n, t } = useTranslation();
  const language = i18n.language as LOCALE;

  const { collapse, setCollapse } = useSiderStoreShallow((state) => ({
    collapse: state.collapse,
    setCollapse: state.setCollapse,
  }));

  const { provider } = useCanvasContext();
  const [unsyncedChanges, setUnsyncedChanges] = useState(provider?.unsyncedChanges || 0);
  const [debouncedUnsyncedChanges] = useDebounce(unsyncedChanges, 500);

  const handleUnsyncedChanges = useCallback((data: number) => {
    setUnsyncedChanges(data);
  }, []);

  useEffect(() => {
    provider.on('unsyncedChanges', handleUnsyncedChanges);
    return () => {
      provider.off('unsyncedChanges', handleUnsyncedChanges);
    };
  }, [provider, handleUnsyncedChanges]);

  const { data, config, showPreview, setShowPreview, showMaxRatio, setShowMaxRatio } = useCanvasStoreShallow(
    (state) => ({
      data: state.data[canvasId],
      config: state.config[canvasId],
      showPreview: state.showPreview,
      setShowPreview: state.setShowPreview,
      showMaxRatio: state.showMaxRatio,
      setShowMaxRatio: state.setShowMaxRatio,
    }),
  );

  const canvasTitle = data?.title;
  const hasCanvasSynced = config?.localSyncedAt > 0 && config?.remoteSyncedAt > 0;

  return (
    <>
      <Helmet>
        <title>{canvasTitle?.toString() || t('common.untitled')} · Refly</title>
      </Helmet>
      <div
        className={`absolute h-16 top-0 left-0 right-0  box-border flex justify-between items-center py-2 px-4 pr-0 bg-transparent ${
          collapse ? 'w-[calc(100vw-12px)]' : 'w-[calc(100vw-232px)]'
        }`}
      >
        <div className="flex items-center relative z-10">
          {collapse && (
            <>
              <SiderPopover>
                <Button
                  type="text"
                  icon={<AiOutlineMenuUnfold size={16} className="text-gray-500" />}
                  onClick={() => {
                    setCollapse(!collapse);
                  }}
                />
              </SiderPopover>
              <Divider type="vertical" className="pr-[4px] h-4" />
            </>
          )}
          <CanvasTitle
            canvasId={canvasId}
            canvasTitle={canvasTitle}
            hasCanvasSynced={hasCanvasSynced}
            debouncedUnsyncedChanges={debouncedUnsyncedChanges}
            language={language}
          />
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <ToolbarButtons
            showPreview={showPreview}
            showMaxRatio={showMaxRatio}
            setShowPreview={setShowPreview}
            setShowMaxRatio={setShowMaxRatio}
          />

          <ActionDropdown canvasId={canvasId} canvasTitle={canvasTitle} />
        </div>
      </div>
    </>
  );
});
