import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import AwardsView from '../views/AwardsView.vue'
import ExperiencesView from '../views/ExperiencesView.vue'
import ResumesView from '../views/ResumesView.vue'
import ResumeEditorView from '../views/ResumeEditorView.vue'
import ApplicationsView from '../views/ApplicationsView.vue'
import DataView from '../views/DataView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView, meta: { title: '工作台' } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { title: '个人档案' } },
    { path: '/projects', name: 'projects', component: ProjectsView, meta: { title: '项目管理' } },
    { path: '/awards', name: 'awards', component: AwardsView, meta: { title: '奖项竞赛' } },
    { path: '/experiences', name: 'experiences', component: ExperiencesView, meta: { title: '经历管理' } },
    { path: '/resumes', name: 'resumes', component: ResumesView, meta: { title: '简历工坊' } },
    {
      path: '/resumes/:id',
      name: 'resume-editor',
      component: ResumeEditorView,
      meta: { title: '编辑简历', wide: true },
    },
    { path: '/applications', name: 'applications', component: ApplicationsView, meta: { title: '投递管理' } },
    { path: '/data', name: 'data', component: DataView, meta: { title: '数据与备份' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title}｜履历引擎` : '履历引擎'
})

export default router
