import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import Contract from '../models/contractModel';

class UserController {
  // Registrar um novo usuário
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      
      // Verificar se usuário já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
      
      // Criar novo usuário
      const user = new User({
        email,
        password,
        name
      });
      
      await user.save();
      
      // Gerar token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
      );
      
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar usuário'
      });
    }
  }
  
  // Login de usuário
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Encontrar usuário
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      // Verificar senha
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      // Gerar token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer login'
      });
    }
  }
  
  // Obter perfil do usuário
  async getProfile(req: Request, res: Response) {
    try {
      const user = await User.findById(req.userId).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter perfil'
      });
    }
  }
  
  // Atualizar perfil do usuário
  async updateProfile(req: Request, res: Response) {
    try {
      const { name, email } = req.body;
      
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      if (name) user.name = name;
      if (email) user.email = email;
      
      await user.save();
      
      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil'
      });
    }
  }
  
  // Obter contratos salvos pelo usuário
  async getSavedContracts(req: Request, res: Response) {
    try {
      const user = await User.findById(req.userId).populate('savedContracts');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // @ts-ignore
      res.json({
        success: true,
        contracts: user.savedContracts
      });
    } catch (error) {
      console.error('Erro ao obter contratos salvos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter contratos salvos'
      });
    }
  }
  
  // Salvar contrato
  async saveContract(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      
      // Verificar se o contrato existe no banco
      let contract = await Contract.findOne({ pncpId: contractId });
      
      if (!contract) {
        // Se não existir, criar novo registro
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }
      
      // Adicionar contrato à lista de salvos do usuário
      await User.findByIdAndUpdate(
        req.userId,
        { $addToSet: { savedContracts: contract._id } }
      );
      
      // Adicionar usuário à lista de observadores do contrato
      await Contract.findByIdAndUpdate(
        contract._id,
        { $addToSet: { watchedBy: req.userId } }
      );
      
      res.json({
        success: true,
        message: 'Contrato salvo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar contrato'
      });
    }
  }
  
  // Remover contrato salvo
  async removeContract(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      
      // Remover contrato da lista do usuário
      await User.findByIdAndUpdate(
        req.userId,
        { $pull: { savedContracts: contractId } }
      );
      
      // Remover usuário da lista de observadores do contrato
      await Contract.findByIdAndUpdate(
        contractId,
        { $pull: { watchedBy: req.userId } }
      );
      
      res.json({
        success: true,
        message: 'Contrato removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao remover contrato'
      });
    }
  }
}

export default new UserController();
