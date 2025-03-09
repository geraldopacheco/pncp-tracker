import { Request, Response } from 'express';
import Contract from '../models/contractModel';
import PNCPService from '../services/pncpService';

class ContractController {
  
  // Buscar contratos
  async searchContracts(req: Request, res: Response) {
    try {
      const { 
        region, 
        status, 
        startDate, 
        endDate, 
        keyword,
        page = '1',
        pageSize = '10'
      } = req.query;
      
      const result = await PNCPService.searchContracts({
        region: region as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        keyword: keyword as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      });
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Erro na busca de contratos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar contratos'
      });
    }
  }
  
  // Obter detalhes de um contrato
  async getContractDetails(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      
      // Primeiro, verificar se temos detalhes no nosso banco
      let contract = await Contract.findOne({ pncpId: contractId });
      
      // Se não tiver, buscar da API do PNCP e salvar
      if (!contract) {
        const contractData = await PNCPService.getContractDetails(contractId);
        
        // Extrair dados relevantes e salvar no banco
        contract = new Contract({
          pncpId: contractId,
          title: contractData.objeto,
          description: contractData.descricao,
          organization: contractData.orgao.nome,
          status: contractData.situacao,
          region: contractData.uf,
          modality: contractData.modalidade,
          publicationDate: contractData.dataPublicacao,
          openingDate: contractData.dataAbertura,
          value: contractData.valorEstimado
        });
        
        await contract.save();
      }
      
      res.json({
        success: true,
        contract
      });
    } catch (error) {
      console.error('Erro ao obter detalhes do contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter detalhes do contrato'
      });
    }
  }
  
  // Adicionar comentário
  async addComment(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'O texto do comentário é obrigatório'
        });
      }
      
      const contract = await Contract.findOneAndUpdate(
        { pncpId: contractId },
        { 
          $push: { 
            comments: { 
              user: req.userId, 
              text 
            } 
          } 
        },
        { new: true }
      );
      
      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }
      
      res.json({
        success: true,
        comments: contract.comments
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar comentário'
      });
    }
  }
  
  // Obter comentários
  async getComments(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      
      const contract = await Contract.findOne({ pncpId: contractId })
        .populate({
          path: 'comments.user',
          select: 'name'
        });
      
      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }
      
      res.json({
        success: true,
        comments: contract.comments
      });
    } catch (error) {
      console.error('Erro ao obter comentários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter comentários'
      });
    }
  }
  
  // Excluir comentário
  async deleteComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      
      const contract = await Contract.findOneAndUpdate(
        { 'comments._id': commentId, 'comments.user': req.userId },
        { $pull: { comments: { _id: commentId } } },
        { new: true }
      );
      
      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Comentário não encontrado ou você não tem permissão para excluí-lo'
        });
      }
      
      res.json({
        success: true,
        message: 'Comentário excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir comentário'
      });
    }
  }
}

export default new ContractController();
