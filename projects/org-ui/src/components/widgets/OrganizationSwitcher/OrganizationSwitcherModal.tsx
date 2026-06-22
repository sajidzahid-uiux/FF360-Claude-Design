import { Building2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FieldFlowOrganizationSourceEnum,
  mapOrganizationsToFieldFlow,
  organizationSourceSupportsLogo,
} from '../../../adapters/organization';
import { ButtonVariantEnum } from '../../../constants';
import { cn } from '../../../utils/cn';
import { modalMobileFullscreenClassName } from '../../../utils/modalShell';
import { Overlay } from '../../system-components/Overlay';
import { Button } from '../../ui-components/Button';
import { Loader } from '../../widgets/Loader';
import { OrganizationCard, type OrganizationCardItem } from './OrganizationCard';
import { OrganizationCreateForm, type OrganizationCreateFormProps } from './OrganizationCreateForm';
import {
  ORG_SWITCHER_COLLAPSE_MS,
  ORG_SWITCHER_SELECT_TOTAL_MS,
} from './organizationSwitcherConstants';

type OrgSwitcherSelectPhase = 'idle' | 'collapse' | 'expand';

export type OrganizationSwitcherItem = OrganizationCardItem;

/** Mobile: centered single column; sm+: cards at least 220px wide, auto-fill row (max ~4 in full modal). */
const ORG_CARD_GRID_FULL_CLASS =
  'mx-auto grid w-full max-w-[280px] grid-cols-1 gap-4 sm:mx-0 sm:max-w-none sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]';

/** Split hub panels are ~half modal width — auto-fill caps columns naturally (~2 max). */
const ORG_CARD_GRID_PANEL_CLASS =
  'mx-auto grid w-full max-w-[280px] grid-cols-1 gap-4 sm:mx-0 sm:max-w-none sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]';

const PlusCircleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden
  >
    <path d="M12 5v14M5 12h14" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export interface OrganizationSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Array<OrganizationSwitcherItem | unknown>;
  onSelectOrganization: (organizationId: OrganizationSwitcherItem['id']) => void;
  selectedOrganizationId?: OrganizationSwitcherItem['id'] | null;
  createForm?: OrganizationCreateFormProps;
  isLoading?: boolean;
  title?: string;
  description?: string;
  organizationSource?: FieldFlowOrganizationSourceEnum;
  /** When omitted, derived from {@link organizationSource} (CMS: true, Tile Design: false). */
  showOrganizationLogo?: boolean;
}

export const OrganizationSwitcherModal = ({
  isOpen,
  onClose,
  organizations,
  onSelectOrganization,
  selectedOrganizationId,
  createForm,
  isLoading = false,
  title = 'Switch Organization',
  description = 'Select an organization to continue or create a new one.',
  organizationSource,
  showOrganizationLogo,
}: OrganizationSwitcherModalProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectPhase, setSelectPhase] = useState<OrgSwitcherSelectPhase>('idle');
  const [activatingId, setActivatingId] = useState<OrganizationSwitcherItem['id'] | null>(
    null
  );
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);
  const selectTimeoutRef = useRef<number | null>(null);
  const expandTimeoutRef = useRef<number | null>(null);
  const supportsLogo =
    showOrganizationLogo ?? organizationSourceSupportsLogo(organizationSource);
  const normalizedOrganizations = useMemo(
    () =>
      mapOrganizationsToFieldFlow(
        organizations as unknown[],
        organizationSource
      ),
    [organizations, organizationSource]
  );

  const clearSelectTimers = useCallback(() => {
    if (selectTimeoutRef.current) {
      clearTimeout(selectTimeoutRef.current);
      selectTimeoutRef.current = null;
    }
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
      expandTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActivatingId(null);
      setSelectPhase('idle');
      clearSelectTimers();
    }
  }, [clearSelectTimers, isOpen]);

  useEffect(() => clearSelectTimers, [clearSelectTimers]);

  const handleSelectOrganization = useCallback(
    (organizationId: OrganizationSwitcherItem['id']) => {
      if (selectPhase !== 'idle') {
        return;
      }

      setActivatingId(organizationId);
      setSelectPhase('collapse');
      bodyScrollRef.current?.scrollTo(0, 0);

      expandTimeoutRef.current = window.setTimeout(() => {
        setSelectPhase('expand');
        expandTimeoutRef.current = null;
      }, ORG_SWITCHER_COLLAPSE_MS);

      selectTimeoutRef.current = window.setTimeout(() => {
        onSelectOrganization(organizationId);
        selectTimeoutRef.current = null;
      }, ORG_SWITCHER_SELECT_TOTAL_MS);
    },
    [onSelectOrganization, selectPhase]
  );

  const selectedId = useMemo(() => {
    if (selectedOrganizationId === undefined || selectedOrganizationId === null) {
      return undefined;
    }
    if (
      typeof selectedOrganizationId === 'number' &&
      Number.isNaN(selectedOrganizationId)
    ) {
      return undefined;
    }
    return selectedOrganizationId;
  }, [selectedOrganizationId]);

  const activeOrganizations = useMemo(
    () =>
      normalizedOrganizations.filter((organization) => organization.isActive !== false),
    [normalizedOrganizations]
  );

  const fieldFlowServiceOrgs = useMemo(
    () => activeOrganizations.filter((organization) => organization.is_service_org),
    [activeOrganizations]
  );

  const standardOrganizations = useMemo(
    () => activeOrganizations.filter((organization) => !organization.is_service_org),
    [activeOrganizations]
  );

  const activatingOrganization = useMemo(() => {
    if (activatingId === null) {
      return null;
    }
    return (
      activeOrganizations.find(
        (organization) => String(organization.id) === String(activatingId)
      ) ?? null
    );
  }, [activatingId, activeOrganizations]);

  const isOrgTransitioning = selectPhase !== 'idle';
  const showSelectionStage =
    isOrgTransitioning && activatingOrganization !== null;
  const hasServiceHub = fieldFlowServiceOrgs.length > 0;

  if (!isOpen) return null;

  if (showCreateForm && createForm) {
    return (
      <OrganizationCreateForm
        {...createForm}
        showLogo={supportsLogo}
        isOpen={isOpen}
        onClose={() => {
          setShowCreateForm(false);
        }}
      />
    );
  }

  const renderOrgCards = (list: typeof activeOrganizations) =>
    list.map((organization) => {
      const isActivating =
        activatingId !== null &&
        String(organization.id) === String(activatingId);

      if (isOrgTransitioning && isActivating) {
        return null;
      }

      return (
        <OrganizationCard
          key={String(organization.id)}
          item={organization}
          isCurrent={organization.id === selectedId}
          onSignIn={handleSelectOrganization}
          showLogo={supportsLogo}
          exiting={isOrgTransitioning && !isActivating}
          promoting={selectPhase === 'collapse' && isActivating}
        />
      );
    });

  const openCreateForm = () => setShowCreateForm(true);

  const createNewCompact = createForm ? (
    <button
      onClick={openCreateForm}
      type="button"
      className="border-border-subtle bg-bg-surface-elevated hover:border-border-strong hover:bg-bg-hover mx-auto flex w-full max-w-[280px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors sm:hidden"
    >
      <PlusCircleIcon className="text-text-primary h-10 w-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-text-primary text-base font-bold">Create New</p>
        <p className="text-text-muted text-xs">Add a new organization</p>
      </div>
    </button>
  ) : null;

  const createNewCard = createForm ? (
    <button
      onClick={openCreateForm}
      type="button"
      className="border-border-subtle bg-bg-surface-elevated hover:border-border-strong hover:bg-bg-hover hidden min-h-[280px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border py-7 text-center transition-colors sm:flex"
    >
      <PlusCircleIcon className="text-text-primary mb-4 h-[50px] w-[50px]" />
      <p className="text-text-primary text-[20px] font-bold">Create New</p>
      <p className="text-text-muted text-xs">Add a new organization</p>
    </button>
  ) : null;

  return (
    <Overlay
      isOpen={isOpen}
      fullscreenOnMobile
      onClose={() => {
        setShowCreateForm(false);
        onClose();
      }}
    >
      <div
        className={cn(
          'bg-bg-surface-elevated relative z-10 flex max-h-[90vh] w-full max-w-[1120px] flex-col overflow-hidden rounded-3xl shadow-2xl',
          modalMobileFullscreenClassName
        )}
      >
        <Button
          aria-label="Close"
          onClick={() => {
            setShowCreateForm(false);
            onClose();
          }}
          variant={ButtonVariantEnum.GHOST}
          iconOnly
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          }
          className="absolute top-4 right-4"
        />
        <div
          className={cn(
            'border-border-subtle/60 bg-bg-surface border-b px-4 pt-4 pb-3 text-left transition-[opacity,padding,max-height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-10 sm:pb-4',
            showSelectionStage &&
              'pointer-events-none max-h-0 overflow-hidden border-b-0 py-0 opacity-0 sm:py-0'
          )}
        >
          <h2 className="text-text-primary pr-10 text-xl font-bold sm:pr-0 sm:text-2xl">{title}</h2>
          <p className="text-text-secondary mt-1 text-sm">{description}</p>
        </div>

        <div
          ref={bodyScrollRef}
          className={cn(
            'relative flex min-h-0 flex-1 flex-col px-4 py-4 sm:p-12 sm:pt-6',
            isOrgTransitioning
              ? 'overflow-hidden'
              : 'gap-6 overflow-y-auto sm:gap-10',
            showSelectionStage && 'px-4 py-4 sm:px-8 sm:py-8'
          )}
        >
          {showSelectionStage && activatingOrganization ? (
            <div
              className="bg-bg-surface-elevated/90 absolute inset-0 z-20 flex items-center justify-center overflow-hidden px-4 py-6 backdrop-blur-[2px] sm:px-8 sm:py-8"
              aria-live="polite"
            >
              <div className="ff-org-switcher-expand-stage w-full max-w-[min(100%,28rem)]">
                <OrganizationCard
                  item={activatingOrganization}
                  showLogo={supportsLogo}
                  expanded={selectPhase === 'expand'}
                  promoting={selectPhase === 'collapse'}
                />
              </div>
            </div>
          ) : null}

          <div
            className={cn(
              'ff-org-switcher-picker flex min-h-0 flex-1 flex-col gap-6 sm:gap-10',
              showSelectionStage && 'ff-org-switcher-picker--hidden pointer-events-none'
            )}
            aria-hidden={showSelectionStage}
          >
          <div
            className={cn(
              'border-accent/25 bg-accent/10 flex items-center gap-4 rounded-2xl border p-4 transition-[opacity,transform,max-height] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] sm:gap-4 sm:p-8 dark:bg-accent/14',
              isOrgTransitioning && 'pointer-events-none max-h-0 overflow-hidden border-0 p-0 opacity-0'
            )}
          >
            <div className="bg-accent text-text-inverse flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm">
              <Building2 className="h-7 w-7" aria-hidden />
            </div>
            <div className="flex flex-col">
              <span className="text-text-secondary text-[16px]">Active Organizations</span>
              <span className="text-[30px] font-bold">{activeOrganizations.length}</span>
            </div>
          </div>

          {isLoading && activeOrganizations.length === 0 ? (
            <div className="flex min-h-[min(50vh,16rem)] w-full flex-1 items-center justify-center">
              <Loader text="Loading organizations" />
            </div>
          ) : hasServiceHub ? (
            <div className="flex flex-col gap-6 max-[820px]:gap-4 lg:flex-row lg:items-stretch lg:gap-8">
              <section className="border-border-subtle bg-bg-surface flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border p-5 sm:p-6">
                <header className="space-y-1">
                  <h3 className="text-text-primary text-lg font-bold tracking-tight">FieldFlow360</h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    System workspace for CMS design requests and reviewer workflows. Separate from your tenant
                    organizations.
                  </p>
                </header>
                <div className={ORG_CARD_GRID_PANEL_CLASS}>{renderOrgCards(fieldFlowServiceOrgs)}</div>
              </section>

              {standardOrganizations.length > 0 || createForm ? (
                <section className="border-border-subtle bg-bg-surface flex min-w-0 flex-[1.1] flex-col gap-4 rounded-2xl border p-5 sm:p-6 lg:min-w-[280px]">
                  <header className="space-y-1">
                    <h3 className="text-text-primary text-lg font-bold tracking-tight">Your organizations</h3>
                    <p className="text-text-muted text-sm leading-relaxed">
                      Organizations you create and manage in Tile Design.
                    </p>
                  </header>
                  {createNewCompact}
                  <div className={ORG_CARD_GRID_PANEL_CLASS}>
                    {createNewCard}
                    {renderOrgCards(standardOrganizations)}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <>
              {createNewCompact}
              <div className={ORG_CARD_GRID_FULL_CLASS}>
                {createNewCard}
                {renderOrgCards(standardOrganizations)}
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </Overlay>
  );
};
