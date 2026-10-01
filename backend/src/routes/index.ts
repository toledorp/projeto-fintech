import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { financialEntryRoutes } from './financialEntryRoutes';

const router = Router();

router.use('/auth', authRoutes);

// Registra as rotas de usuários sob o prefixo /users
router.use('/users', userRoutes);
router.use('/lancamentos', financialEntryRoutes);

export { router as appRoutes };
