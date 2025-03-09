import axios from 'axios';

const BASE_URL = 'https://pncp.gov.br/api/consulta';

export interface ContractSearchParams {
  region?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

class PNCPService {
  
  async searchContracts(params: ContractSearchParams) {
    try {
      // Construir parâmetros para a API do PNCP
      const apiParams: any = {
        pagina: params.page || 1,
        tamanhoPagina: params.pageSize || 10
      };
      
      if (params.region) {
        apiParams.uf = params.region;
      }
      
      if (params.status) {
        apiParams.situacao = params.status;
      }
      
      if (params.startDate) {
        apiParams.dataPublicacaoInicio = params.startDate;
      }
      
      if (params.endDate) {
        apiParams.dataPublicacaoFim = params.endDate;
      }
      
      // Fazer requisição à API do PNCP
      const response = await axios.get(`${BASE_URL}/compras-publicas-em-andamento`, {
        params: apiParams
      });
      
      let results = response.data;
      
      // Filtrar por palavra-chave se fornecida
      if (params.keyword && params.keyword.trim() !== '') {
        const keyword = params.keyword.toLowerCase();
        results.compraPublicasEmAndamento = results.compraPublicasEmAndamento.filter((contract: any) => {
          return (
            (contract.objeto && contract.objeto.toLowerCase().includes(keyword)) ||
            (contract.nome && contract.nome.toLowerCase().includes(keyword)) ||
            (contract.descricao && contract.descricao.toLowerCase().includes(keyword))
          );
        });
      }
      
      return results;
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw error;
    }
  }
  
  async getContractDetails(contractId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/compras-publicas/${contractId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do contrato ${contractId}:`, error);
      throw error;
    }
  }
}

export default new PNCPService();
