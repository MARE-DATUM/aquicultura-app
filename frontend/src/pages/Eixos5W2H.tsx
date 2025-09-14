import React, { useState, useEffect } from 'react';
import { 
  Plus,
  RefreshCw,
  FileText,
  BarChart3
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { useEixos5W2H } from '../hooks/useEixos5W2H';
import { PageHeader, Card, Button, EmptyState, Alert, Dialog, DialogContent, DialogHeader, DialogTitle, ResponsiveGrid } from '../components/ui';
import EixoForm from '../components/EixoForm';
import EixoDetails from '../components/EixoDetails';
import EixoCard from '../components/EixoCard';
import FiltrosEixos from '../components/FiltrosEixos';
import type { Eixo5W2H, Periodo5W2H } from '../types/simple';

const Eixos5W2H: React.FC = () => {
  const {
    eixos,
    projetos,
    loading,
    refreshing,
    error,
    filtroProjeto,
    filtroPeriodo,
    searchTerm,
    loadData,
    createEixo,
    updateEixo,
    deleteEixo,
    setFiltroProjeto,
    setFiltroPeriodo,
    setSearchTerm,
    clearFilters,
    applyFilters
  } = useEixos5W2H();

  const { canCreate, canEdit, canDelete } = usePermissions();

  // Estados de UI
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [eixoSelecionado, setEixoSelecionado] = useState<Eixo5W2H | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleRefresh = () => {
    loadData(true);
  };

  const handleNovoEixo = () => {
    setEixoSelecionado(null);
    setModalType('create');
    setMostrarModal(true);
  };

  const handleViewEixo = (eixo: Eixo5W2H) => {
    setEixoSelecionado(eixo);
    setModalType('view');
    setMostrarModal(true);
  };

  const handleEditEixo = (eixo: Eixo5W2H) => {
    setEixoSelecionado(eixo);
    setModalType('edit');
    setMostrarModal(true);
  };

  const handleDeleteEixo = async (eixo: Eixo5W2H) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o eixo "${eixo.what.substring(0, 50)}..."?`)) {
      return;
    }
    
    try {
      setLoadingAction(true);
      await deleteEixo(eixo.id);
      setMostrarModal(false);
      setEixoSelecionado(null);
    } catch (err) {
      console.error('Erro ao eliminar eixo:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSubmitForm = async (data: any) => {
    try {
      setLoadingAction(true);
      
      if (modalType === 'create') {
        await createEixo(data);
      } else if (modalType === 'edit' && eixoSelecionado) {
        await updateEixo(eixoSelecionado.id, data);
      }
      
      setMostrarModal(false);
      setEixoSelecionado(null);
    } catch (err) {
      console.error('Erro ao guardar eixo:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCloseModal = () => {
    setMostrarModal(false);
    setEixoSelecionado(null);
    setLoadingAction(false);
  };

  const handleFiltrosChange = () => {
    applyFilters();
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'create': return 'Novo Eixo do Plano';
      case 'edit': return 'Editar Eixo do Plano';
      case 'view': return 'Detalhes do Eixo';
      default: return 'Eixo do Plano';
    }
  };

  const renderModalContent = () => {
    if (modalType === 'view' && eixoSelecionado) {
      return (
        <EixoDetails
          eixo={eixoSelecionado}
          onEdit={canEdit() ? () => handleEditEixo(eixoSelecionado) : undefined}
          onDelete={canDelete() ? () => handleDeleteEixo(eixoSelecionado) : undefined}
          onClose={handleCloseModal}
          canEdit={canEdit()}
          canDelete={canDelete()}
        />
      );
    }

    if ((modalType === 'create' || modalType === 'edit') && projetos.length > 0) {
      return (
        <EixoForm
          eixo={modalType === 'edit' ? eixoSelecionado : undefined}
          projetos={projetos}
          onSubmit={handleSubmitForm}
          onCancel={handleCloseModal}
          loading={loadingAction}
        />
      );
    }

    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Carregando...
        </h3>
        <p className="text-gray-500 mb-6">
          Aguarde enquanto carregamos os dados necessários.
        </p>
        <Button
          variant="secondary"
          onClick={handleCloseModal}
        >
          Fechar
        </Button>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Eixos do Plano 7 Passos"
        breadcrumbs={[
          { label: 'Plano', href: '/plano' },
          { label: 'Eixos 5W2H' }
        ]}
        actions={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            {canCreate() && (
              <Button onClick={handleNovoEixo}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Eixo
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        {/* Filtros */}
        <FiltrosEixos
          projetos={projetos}
          filtroProjeto={filtroProjeto}
          filtroPeriodo={filtroPeriodo}
          searchTerm={searchTerm}
          onFiltroProjetoChange={setFiltroProjeto}
          onFiltroPeriodoChange={setFiltroPeriodo}
          onSearchChange={setSearchTerm}
          onClearFilters={clearFilters}
          onApplyFilters={handleFiltrosChange}
          loading={loading}
          totalResults={eixos.length}
        />

        {/* Mensagem de Erro */}
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {/* Lista de Eixos */}
        {loading ? (
          <ResponsiveGrid 
            cols={{ default: 1, sm: 2, lg: 3, xl: 4 }}
            gap="md"
          >
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        ) : eixos.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Nenhum eixo encontrado"
            description={
              searchTerm || filtroProjeto || filtroPeriodo
                ? "Nenhum eixo corresponde aos filtros aplicados. Tente ajustar os critérios de pesquisa."
                : "Ainda não há eixos 5W2H cadastrados. Clique em 'Novo Eixo' para começar."
            }
            action={
              canCreate() ? {
                label: 'Criar Primeiro Eixo',
                onClick: handleNovoEixo,
                variant: 'primary' as const
              } : undefined
            }
          />
        ) : (
          <ResponsiveGrid 
            cols={{ default: 1, sm: 2, lg: 3, xl: 4 }}
            gap="md"
          >
            {eixos.map((eixo) => (
              <EixoCard
                key={eixo.id}
                eixo={eixo}
                onView={() => handleViewEixo(eixo)}
                onEdit={canEdit() ? () => handleEditEixo(eixo) : undefined}
                onDelete={canDelete() ? () => handleDeleteEixo(eixo) : undefined}
                canEdit={canEdit()}
                canDelete={canDelete()}
              />
            ))}
          </ResponsiveGrid>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={mostrarModal} onOpenChange={setMostrarModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {getModalTitle()}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {renderModalContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Eixos5W2H;