import { Router } from 'express'
import { AdminController } from '@/controllers/admin.controller'

const router = Router()
const adminController = new AdminController()

// Dashboard stats
router.get('/dashboard/stats', adminController.getDashboardStats)

// Recent activity
router.get('/recent-activity', adminController.getRecentActivity)

// System alerts
router.get('/alerts', adminController.getSystemAlerts)
router.post('/alerts/:id/resolve', adminController.resolveAlert)
router.post('/alerts/:id/ignore', adminController.ignoreAlert)

// Course summary
router.get('/courses/summary', adminController.getCourseSummary)

// Quick stats
router.get('/quick-stats', adminController.getQuickStats)

export default router
