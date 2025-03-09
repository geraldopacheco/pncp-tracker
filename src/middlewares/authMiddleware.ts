import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Estender a interface Request para incluir o userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// @ts-ignore
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar header de autorização
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acesso não autorizado. Token não fornecido.' 
      });
    }
    
    // Extrair token
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    // @ts-ignore
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // Adicionar ID do usuário ao objeto de requisição
    // @ts-ignore
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido ou expirado.' 
    });
  }
};

export default authMiddleware;
