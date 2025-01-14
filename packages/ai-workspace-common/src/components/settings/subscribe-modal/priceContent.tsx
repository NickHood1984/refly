import { useState } from 'react';

import { Button, Divider, Tooltip, Row, Col } from 'antd';

// styles
import './index.scss';
import { useTranslation } from 'react-i18next';
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
import { IconCheck, IconQuestionCircle, IconStar } from '@arco-design/web-react/icon';
import { useSubscriptionStoreShallow } from '@refly-packages/ai-workspace-common/stores/subscription';
import { useUserStoreShallow } from '@refly-packages/ai-workspace-common/stores/user';
import { useNavigate } from '@refly-packages/ai-workspace-common/utils/router';
import { useAuthStoreShallow } from '@refly-packages/ai-workspace-common/stores/auth';
import { SubscriptionPlanType } from '@refly/openapi-schema';

export type SubscriptionInterval = 'monthly' | 'yearly';
export type PriceSource = 'page' | 'modal';

const premiumModels = 'GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro and more';
const basicModels = 'GPT-4o Mini, DeepSeek V3, Llama 3.1 70B, Qwen 2.5 72B and more';
const freeModels = 'Gemini 2.0 Flash and more';
const mediaModels = 'FLUX1.1 [pro], Ideogram V2, Recraft V3, Kling 1.6, Haiper 2.0 and more';

const gridSpan = {
  xs: 24,
  sm: 12,
  md: 8,
  lg: 7,
  xl: 6,
  xxl: 5,
};

interface ModelFeatures {
  name: string;
  count?: string;
  details?: string;
  tooltip?: string;
}

const PlanItem = (props: {
  title: SubscriptionPlanType;
  features: ModelFeatures[];
  handleClick?: () => void;
  interval: SubscriptionInterval;
  loadingInfo: {
    isLoading: boolean;
    plan: string;
  };
}) => {
  const { t } = useTranslation();
  const { title, features, handleClick, interval, loadingInfo } = props;
  const { isLogin } = useUserStoreShallow((state) => ({
    isLogin: state.isLogin,
  }));
  const { setLoginModalOpen } = useAuthStoreShallow((state) => ({
    setLoginModalOpen: state.setLoginModalOpen,
  }));
  const [isHovered, setIsHovered] = useState(false);

  const getPrice = (plan: SubscriptionPlanType) => {
    switch (plan) {
      case 'max':
        return interval === 'monthly' ? 19.9 : 99.5;
      case 'pro':
        return interval === 'monthly' ? 9.9 : 49.5;
      case 'free':
        return 0;
    }
  };

  const getButtonText = (plan: SubscriptionPlanType) => {
    if (isLogin) {
      switch (plan) {
        case 'max':
        case 'pro':
          return t('settings.subscription.subscribe.upgrade');
        case 'free':
          return t('settings.subscription.subscribe.continueFree');
        default:
          return t('settings.subscription.getStarted');
      }
    } else {
      return t('settings.subscription.getStarted');
    }
  };

  const handleButtonClick = () => {
    if (isLogin) {
      handleClick();
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col ${title === 'max' ? 'pro-plan' : ''}`}>
      <div className="h-[20px] text-center text-xs text-white font-bold">
        {title === 'max' && t('settings.subscription.mostPopular')}
      </div>
      <div
        className={`
        subscribe-content-plans-item
        ${title === 'free' && 'item-free bg-gray-50'}
        ${title === 'pro' && 'item-pro bg-[#EBF1FF]'}
        ${title === 'max' && 'item-max bg-[#FFF5EB]'}`}
      >
        <div className="subscribe-content-plans-item-title font-extrabold">
          {t(`settings.subscription.subscriptionStatus.${title}`)}
        </div>

        <div className="description">{t(`settings.subscription.subscribe.${title}.description`)}</div>

        <div className="h-16">
          <div className="subscribe-content-plans-item-price">
            <span className="price text-3xl">
              {title !== 'free' ? (
                <>${interval === 'monthly' ? getPrice(title) : Math.round((getPrice(title) / 12) * 10) / 10}</>
              ) : (
                t('settings.subscription.subscribe.forFree')
              )}
            </span>
            <span className="period !text-xs">
              {' '}
              /{' '}
              {title === 'free' ? (
                t('settings.subscription.subscribe.period')
              ) : (
                <span className="whitespace-nowrap">{t(`settings.subscription.subscribe.month`)}</span>
              )}
            </span>
          </div>

          {interval === 'yearly' && title !== 'free' && (
            <div className="">
              <span className="price text-base">
                ${getPrice(title)}
                <span className="text-sm text-gray-500 ml-1">
                  <span className="line-through decoration-gray-700 ">${getPrice(title) * 2}</span>
                </span>
              </span>
              <span className="period !text-xs">
                {' '}
                / <span className="whitespace-nowrap">{t(`settings.subscription.subscribe.${'firstYear'}`)}</span>
                {'*'}
              </span>
            </div>
          )}
        </div>

        <Button
          className={`subscribe-btn subscribe-btn--${title}`}
          onClick={handleButtonClick}
          loading={loadingInfo.isLoading && loadingInfo.plan === title}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            <span
              className={`
                inline-flex
                items-center
                justify-center
                w-full
                h-full
                transition-transform duration-300
                absolute
                ${isHovered ? '-translate-y-full' : 'translate-y-0'}
              `}
            >
              {getButtonText(title)}
            </span>
            <span
              className={`
                absolute
                inline-flex
                items-center
                justify-center
                w-full
                h-full
                m-auto
                transition-transform duration-300
                ${isHovered ? 'translate-y-0' : 'translate-y-full'}
              `}
            >
              {getButtonText(title)}
            </span>
          </div>
        </Button>

        <div className="plane-features">
          <Divider className="mt-2 mb-6" />
          {features.map((feature, index) => (
            <div className="plane-features-item" key={index}>
              <div className="text-gray-500">
                <IconCheck style={{ color: 'green', strokeWidth: 6 }} /> {feature.name}
                {feature.tooltip && (
                  <Tooltip title={<div>{feature.tooltip}</div>}>
                    <IconQuestionCircle className="ml-1" />
                  </Tooltip>
                )}
              </div>
              {feature.count && <div className="ml-4 text-sm text-black font-medium">{feature.count}</div>}
              <div className="ml-4 text-xs text-gray-400">{feature.details}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PriceContent = (props: { source: PriceSource }) => {
  const navigate = useNavigate();
  const { source } = props;
  const { t } = useTranslation();
  const { setSubscribeModalVisible: setVisible } = useSubscriptionStoreShallow((state) => ({
    setSubscribeModalVisible: state.setSubscribeModalVisible,
  }));
  const { setLoginModalOpen } = useAuthStoreShallow((state) => ({
    setLoginModalOpen: state.setLoginModalOpen,
  }));
  const { isLogin } = useUserStoreShallow((state) => ({
    isLogin: state.isLogin,
  }));

  const [interval, setInterval] = useState<SubscriptionInterval>('yearly');
  const [loadingInfo, setLoadingInfo] = useState<{
    isLoading: boolean;
    plan: string;
  }>({
    isLoading: false,
    plan: '',
  });

  const t1ModelName = t('settings.subscription.subscribe.t1Model');
  const t2ModelName = t('settings.subscription.subscribe.t2Model');
  const freeModelName = t('settings.subscription.subscribe.freeModel');
  const vectorStorageName = t('settings.subscription.subscribe.vectorStorage');
  const fileStorageName = t('settings.subscription.subscribe.fileStorage');
  const mediaCreditName = t('settings.subscription.subscribe.mediaCredit');
  const modalTooltipContent = t('settings.subscription.subscribe.tooltip.modelToken');
  const vectorStorageTooltipContent = t('settings.subscription.subscribe.tooltip.vectorStorage');
  const fileStorageTooltipContent = t('settings.subscription.subscribe.tooltip.fileStorage');
  const mediaCreditTooltipContent = t('settings.subscription.subscribe.tooltip.mediaCredit');
  const unlimited = t('settings.subscription.subscribe.unlimited');
  const oneTime = t('settings.subscription.subscribe.oneTime');
  const month = t('settings.subscription.subscribe.month');

  const freeFeatures: ModelFeatures[] = [
    {
      name: t2ModelName,
      count: `1M tokens / ${oneTime}`,
      details: basicModels,
      tooltip: modalTooltipContent,
    },
    {
      name: freeModelName,
      count: unlimited,
      details: freeModels,
      tooltip: modalTooltipContent,
    },
    {
      name: mediaCreditName,
      count: '5',
      details: mediaModels,
      tooltip: mediaCreditTooltipContent,
    },
    {
      name: vectorStorageName,
      count: '10MB',
      tooltip: vectorStorageTooltipContent,
    },
    {
      name: fileStorageName,
      count: '100MB',
      tooltip: fileStorageTooltipContent,
    },
    {
      name: t('settings.subscription.subscribe.free.serviceSupport.name'),
      count: t('settings.subscription.subscribe.free.serviceSupport.details'),
    },
  ];

  const proFeatures: ModelFeatures[] = [
    {
      name: t1ModelName,
      count: `1M tokens / ${month}`,
      details: premiumModels,
      tooltip: modalTooltipContent,
    },
    {
      name: t2ModelName,
      count: unlimited,
      details: basicModels,
      tooltip: modalTooltipContent,
    },
    {
      name: freeModelName,
      count: unlimited,
      details: freeModels,
      tooltip: modalTooltipContent,
    },
    {
      name: mediaCreditName,
      count: '50',
      details: mediaModels,
      tooltip: mediaCreditTooltipContent,
    },
    {
      name: vectorStorageName,
      count: '50MB',
      tooltip: vectorStorageTooltipContent,
    },
    {
      name: fileStorageName,
      count: '500MB',
      tooltip: fileStorageTooltipContent,
    },
    {
      name: t('settings.subscription.subscribe.pro.serviceSupport.name'),
      count: t('settings.subscription.subscribe.pro.serviceSupport.details'),
    },
  ];

  const maxFeatures: ModelFeatures[] = [
    {
      name: t1ModelName,
      count: unlimited,
      details: premiumModels,
      tooltip: modalTooltipContent,
    },
    {
      name: t2ModelName,
      count: unlimited,
      details: basicModels,
      tooltip: modalTooltipContent,
    },
    {
      name: freeModelName,
      count: unlimited,
      details: freeModels,
      tooltip: modalTooltipContent,
    },
    {
      name: mediaCreditName,
      count: '100',
      details: mediaModels,
      tooltip: mediaCreditTooltipContent,
    },
    {
      name: vectorStorageName,
      count: '100MB',
      tooltip: vectorStorageTooltipContent,
    },
    {
      name: fileStorageName,
      count: '1G',
      tooltip: fileStorageTooltipContent,
    },
    {
      name: t('settings.subscription.subscribe.max.serviceSupport.name'),
      count: t('settings.subscription.subscribe.max.serviceSupport.details'),
    },
  ];

  const createCheckoutSession = async (plan: 'max' | 'pro' | 'ultra') => {
    if (loadingInfo.isLoading) return;
    setLoadingInfo({
      isLoading: true,
      plan,
    });
    const { data } = await getClient().createCheckoutSession({
      body: {
        planType: plan,
        interval: interval,
      },
    });
    setLoadingInfo({
      isLoading: false,
      plan: '',
    });

    if (data?.data?.url) {
      window.location.href = data.data.url;
    }
  };

  return (
    <div className="subscribe-content w-full">
      <div className="flex items-center justify-center">
        <div className="text-base ml-1 border border-solid border-yellow-500 rounded-xl px-4 py-1 w-fit mb-4 flex items-center gap-2">
          <span>🎉</span>
          <span className="inline bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:200%_100%] bg-clip-text text-transparent animate-[gradient-animation_1s_ease-in-out_infinite]">
            {t('landingPage.pricing.limitedOffer')}
          </span>
        </div>
      </div>

      <div className="subscribe-content-type">
        <div className="subscribe-content-type-inner">
          <div
            className={`subscribe-content-type-inner-item ${interval === 'yearly' ? 'active' : ''}`}
            onClick={() => setInterval('yearly')}
          >
            <span>{t('settings.subscription.subscribe.yearly')}</span>
          </div>

          <div
            className={`subscribe-content-type-inner-item ${interval === 'monthly' ? 'active' : ''}`}
            onClick={() => setInterval('monthly')}
          >
            {t('settings.subscription.subscribe.monthly')}
          </div>
        </div>
      </div>

      <Row gutter={[4, 4]} className="subscribe-content-plans" justify="center" align="stretch">
        <Col {...gridSpan}>
          <PlanItem
            title="free"
            features={freeFeatures}
            handleClick={() => {
              isLogin
                ? source === 'modal'
                  ? setVisible(false)
                  : navigate('/', { replace: true })
                : setLoginModalOpen(true);
            }}
            interval={interval}
            loadingInfo={loadingInfo}
          />
        </Col>

        <Col {...gridSpan}>
          <PlanItem
            title="pro"
            features={proFeatures}
            handleClick={() => createCheckoutSession('pro')}
            interval={interval}
            loadingInfo={loadingInfo}
          />
        </Col>

        <Col {...gridSpan}>
          <PlanItem
            title="max"
            features={maxFeatures}
            handleClick={() => createCheckoutSession('max')}
            interval={interval}
            loadingInfo={loadingInfo}
          />
        </Col>
      </Row>

      <div className="px-4 text-center text-gray-600 mt-4">
        * {t('settings.subscription.subscribe.firstYearOffCountDescription')}
      </div>

      {isLogin && (
        <div className="subscribe-content-description">
          {t('settings.subscription.subscribe.description')}{' '}
          <a href={`/privacy`} target="_blank" rel="noreferrer">
            {t('settings.subscription.subscribe.privacy')}
          </a>{' '}
          {t('settings.subscription.subscribe.and')}{' '}
          <a href={`/terms`} target="_blank" rel="noreferrer">
            {t('settings.subscription.subscribe.terms')}
          </a>
        </div>
      )}
    </div>
  );
};
