import { Router } from 'express';

const router = Router();

router.get('/app', (req, res) => {
  res.json({
    success: true,
    message: 'You have reached the app route.',
  });
});

export default router;
