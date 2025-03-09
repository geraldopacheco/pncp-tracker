const express = require('express');
const axios = require('axios');
const router = express.Router();

// URL base da API do PNCP - ajuste para a versão v1
const BASE_URL = 'https://pncp.gov.br/api/consulta/v1';

// Função auxiliar para formatar a data no formato esperado pela API
function formatDateForAPI(dateString) {
  // Converte de YYYY-MM-DD para YYYYMMDD
  if (!dateString) return null;
  
  return dateString.replace(/-/g, '');
}

// Rota para buscar contratos
router.get('/search/contratos', async (req, res) => {
  try {
    // Parâmetros da consulta
    const { 
      region, 
      status, 
      startDate, 
      endDate, 
      keyword, 
      page = 1, 
      pageSize = 10 
    } = req.query;
    
    console.log('Parâmetros recebidos para busca de contratos:', req.query);
    
    // Construir parâmetros para a API
    const params = {
      pagina: page,
      tamanhoPagina: pageSize
    };
    
    if (region) params.uf = region;
    if (status) params.situacao = status;
    if (startDate) params.dataInicial = formatDateForAPI(startDate);
    if (endDate) params.dataFinal = formatDateForAPI(endDate);
    
    console.log('Parâmetros para API:', params);
    console.log('URL completa:', `${BASE_URL}/contratos/atualizacao`);
    
    // Fazer a requisição à API do PNCP
    const response = await axios.get(`${BASE_URL}/contratos/atualizacao`, { params });
    console.log('Status da resposta:', response.status);
    
    let results = response.data;
    
    // Filtrar por palavra-chave se fornecida (já que a API não suporta esse filtro)
    if (keyword && keyword.trim() !== '' && results.data && Array.isArray(results.data)) {
      const term = keyword.toLowerCase();
      results.data = results.data.filter(contract => {
        return (
          (contract.objetoContrato && contract.objetoContrato.toLowerCase().includes(term)) ||
          (contract.numeroContratoEmpenho && contract.numeroContratoEmpenho.toLowerCase().includes(term)) ||
          (contract.nomeRazaoSocialFornecedor && contract.nomeRazaoSocialFornecedor.toLowerCase().includes(term))
        );
      });
    }
    
    // Retornar resultados
    res.json({
      success: true,
      type: 'contratos',
      ...results
    });
  } catch (error) {
    console.error('Erro na busca de contratos:', error.message);
    if (error.response) {
      console.error('Resposta da API:', error.response.data);
      console.error('Status da API:', error.response.status);
    }
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contratos',
      error: error.message
    });
  }
});

// Rota para buscar contratações
router.get('/search/contratacoes', async (req, res) => {
  try {
    // Parâmetros da consulta
    const { 
      region, 
      status, 
      startDate, 
      endDate, 
      keyword, 
      page = 1, 
      pageSize = 10 
    } = req.query;
    
    console.log('Parâmetros recebidos para busca de contratações:', req.query);
    
    // Construir parâmetros para a API
    const params = {
      pagina: page,
      tamanhoPagina: pageSize
    };
    
    if (region) params.uf = region;
    if (status) params.situacao = status;
    if (startDate) params.dataInicial = formatDateForAPI(startDate);
    if (endDate) params.dataFinal = formatDateForAPI(endDate);
    
    console.log('Parâmetros para API:', params);
    console.log('URL completa:', `${BASE_URL}/contratacoes/atualizacao`);
    
    // Fazer a requisição à API do PNCP
    const response = await axios.get(`${BASE_URL}/contratacoes/atualizacao`, { params });
    console.log('Status da resposta:', response.status);
    
    let results = response.data;
    
    // Filtrar por palavra-chave se fornecida (já que a API não suporta esse filtro)
    if (keyword && keyword.trim() !== '' && results.data && Array.isArray(results.data)) {
      const term = keyword.toLowerCase();
      results.data = results.data.filter(contratacao => {
        return (
          (contratacao.objetoCompra && contratacao.objetoCompra.toLowerCase().includes(term)) ||
          (contratacao.processo && contratacao.processo.toLowerCase().includes(term)) ||
          (contratacao.orgaoEntidade && contratacao.orgaoEntidade.razaoSocial && 
            contratacao.orgaoEntidade.razaoSocial.toLowerCase().includes(term))
        );
      });
    }
    
    // Retornar resultados
    res.json({
      success: true,
      type: 'contratacoes',
      ...results
    });
  } catch (error) {
    console.error('Erro na busca de contratações:', error.message);
    if (error.response) {
      console.error('Resposta da API:', error.response.data);
      console.error('Status da API:', error.response.status);
    }
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contratações',
      error: error.message
    });
  }
});

// Rota para busca unificada (para manter compatibilidade)
router.get('/search', async (req, res) => {
  try {
    // Redirecionar para contratos por padrão
    const response = await axios.get(`${req.protocol}://${req.get('host')}/api/contracts/search/contratos${req.url.replace('/search', '')}`);
    res.json(response.data);
  } catch (error) {
    console.error('Erro na busca unificada:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar busca',
      error: error.message
    });
  }
});

// Rota para obter detalhes de um contrato específico
router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${BASE_URL}/contratos/${id}`);
    
    res.json({
      success: true,
      contract: response.data
    });
  } catch (error) {
    console.error(`Erro ao buscar detalhes do contrato ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes do contrato',
      error: error.message
    });
  }
});

// Rota para depuração da API
router.get('/debug', async (req, res) => {
  try {
    const { endpoint, params } = req.query;
    
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint não especificado'
      });
    }
    
    let parsedParams = {};
    if (params) {
      try {
        parsedParams = JSON.parse(params);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Erro ao parsear parâmetros JSON',
          error: error.message
        });
      }
    }
    
    // Ajuste a URL base para a versão v1
    console.log(`Fazendo requisição para ${BASE_URL}${endpoint} com parâmetros:`, parsedParams);
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, { params: parsedParams });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Erro na depuração da API:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na depuração da API',
      error: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
  }
});

module.exports = router;
