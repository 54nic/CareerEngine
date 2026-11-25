import {
  awardToResumeItem,
  createResume,
  experienceToResumeItem,
  projectToResumeItem,
} from './resume'
import { nowISO, uid } from './utils'

export function buildSampleData() {
  const stamp = nowISO()
  const profile = {
    id: 'me',
    name: '林知远',
    headline: '前端开发 / 产品方向',
    phone: '138 0000 0000',
    email: 'linzhiyuan@example.com',
    city: '杭州',
    website: 'zhiyuan.dev',
    github: 'github.com/zhiyuan-lin',
    summary:
      '浙江大学计算机科学与技术专业 2027 届本科生，专注前端工程与产品体验。熟悉 Vue 3 技术栈，有两段互联网研发实习经历，主导过 3 个校园产品从 0 到 1 的落地。习惯用数据和用户反馈驱动迭代，希望在真实业务中持续打磨工程能力与产品判断。',
    educations: [
      {
        id: 'edu-zju',
        school: '浙江大学',
        degree: '本科',
        major: '计算机科学与技术',
        start: '2023-09',
        end: '2027-06',
        gpa: '3.82 / 4.0',
        ranking: '专业前 5%',
        details: ['主修课程：数据结构、操作系统、计算机网络、人机交互', '连续两年获浙江大学优秀学生奖学金'],
      },
    ],
    skills: [
      { id: 'skill-lang', category: '编程语言', items: ['TypeScript', 'JavaScript', 'Python', 'Java'] },
      { id: 'skill-fe', category: '前端工程', items: ['Vue 3', 'React', 'Vite', 'Tailwind CSS', 'Pinia'] },
      { id: 'skill-tool', category: '工具与协作', items: ['Git', 'Docker', 'Postman', 'Figma'] },
      { id: 'skill-pm', category: '产品方法', items: ['用户访谈', '需求分析', '原型设计', '数据分析'] },
    ],
    updatedAt: stamp,
  }

  const projects = [
    {
      id: 'proj-engine',
      name: '履历引擎个人经历资产库',
      role: '独立开发',
      startDate: '2026-03',
      endDate: '2026-06',
      summary: '面向大学生与研究生的经历管理与简历生成工具，把散落的项目、奖项和实习经历沉淀为可重复使用的个人资产。',
      highlights: [
        '设计「经历资产库 → 多版本简历」的数据模型，让同一段项目、奖项可以被不同简历重复引用；',
        '使用 IndexedDB 实现本地持久化与 JSON 备份恢复，简历保存独立内容快照，修改原始经历不影响已投递版本；',
        '实现三套可切换简历模板、实时预览与 A4 打印导出，形成从录入到投递的完整闭环。',
      ],
      techStack: ['Vue 3', 'Vite', 'Tailwind CSS', 'Pinia', 'IndexedDB'],
      tags: ['个人项目', '前端'],
      links: [{ label: '在线演示', url: 'https://example.com' }],
      attachments: [],
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: 'proj-books',
      name: '校园二手书交易平台',
      role: '前端负责人',
      startDate: '2025-09',
      endDate: '2026-01',
      summary: '面向校内教材流转的轻量交易平台，支持发布、搜索、收藏与站内沟通。',
      highlights: [
        '负责 12 个页面的组件拆分与状态管理，搭建基于 Vite 的构建与按需加载方案；',
        '联合 3 人团队完成首版上线，累计发布 600+ 本教材，覆盖 8 个学院；',
        '基于埋点数据优化搜索与筛选路径，核心交易流程点击次数从 7 次降至 4 次。',
      ],
      techStack: ['Vue 3', 'Element Plus', 'Vite', 'Node.js', 'MySQL'],
      tags: ['团队项目', '校园产品'],
      links: [],
      attachments: [],
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: 'proj-ar',
      name: '校园 AR 导览小程序',
      role: '产品设计 / 前端开发',
      startDate: '2025-03',
      endDate: '2025-06',
      summary: '通过 AR 标记帮助新生快速找到教室与公共设施的小程序。',
      highlights: [
        '完成 20 位同学的访谈与可用性测试，将「找到教室」定义为核心使用场景；',
        '与 2 位同学协作完成 3 个核心页面与 AR 标记交互，上线首月访问 1200+ 次；',
        '设计活动期间运营物料与传播路径，获得校级创新项目立项。',
      ],
      techStack: ['微信小程序', 'TypeScript', 'AR', 'Figma'],
      tags: ['产品设计', '小程序'],
      links: [],
      attachments: [],
      createdAt: stamp,
      updatedAt: stamp,
    },
  ]

  const awards = [
    {
      id: 'award-cdca',
      title: '中国大学生计算机设计大赛',
      level: '国家级',
      rank: '三等奖',
      date: '2026-07',
      issuer: '中国大学生计算机设计大赛组委会',
      description: '作品《履历引擎》获软件应用与开发类三等奖，负责产品设计、前端开发与答辩展示。',
      certificate: null,
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: 'award-lanqiao',
      title: '蓝桥杯全国软件和信息技术专业人才大赛',
      level: '省级',
      rank: '一等奖',
      date: '2026-04',
      issuer: '工业和信息化部人才交流中心',
      description: 'Web 应用开发大学组省级一等奖。',
      certificate: null,
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: 'award-scholarship',
      title: '浙江大学优秀学生奖学金',
      level: '校级',
      rank: '一等奖',
      date: '2025-10',
      issuer: '浙江大学',
      description: '2024—2025 学年学业成绩与综合表现排名专业前 5%。',
      certificate: null,
      createdAt: stamp,
      updatedAt: stamp,
    },
  ]

  const experiences = [
    {
      id: 'exp-intern',
      type: 'internship',
      org: '杭州某科技有限公司',
      title: '前端开发实习生',
      location: '杭州',
      startDate: '2026-07',
      endDate: '2026-09',
      description: '',
      highlights: [
        '参与企业级数据看板从 0 到 1 的开发，独立负责 6 个业务模块的组件封装与接口联调；',
        '基于 Vue 3 + ECharts 实现可配置图表，将新指标接入时间从 2 天缩短至 4 小时；',
        '配合后端完成接口性能排查，首屏加载时间从 2.4s 优化至 1.1s。',
      ],
      tags: ['实习'],
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: 'exp-research',
      type: 'research',
      org: '浙江大学 CAD&CG 国家重点实验室',
      title: '科研助理',
      location: '杭州',
      startDate: '2025-11',
      endDate: '2026-05',
      description: '',
      highlights: [
        '参与「人机协同创作」方向的文献调研与实验设计，整理 40+ 篇相关论文；',
        '实现数据预处理与可视化脚本，支持 3 组用户实验的数据分析与结果复现；',
        '协助撰写实验章节并参与组会汇报。',
      ],
      tags: ['科研'],
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: 'exp-student',
      type: 'campus',
      org: '计算机学院学生会',
      title: '技术部负责人',
      location: '杭州',
      startDate: '2024-09',
      endDate: '2025-09',
      description: '',
      highlights: [
        '带领 6 人小组维护学院活动网站与报名系统，服务 10+ 场活动；',
        '建立组件与文档规范，将活动页面平均交付时间从 3 天缩短到 1 天。',
      ],
      tags: ['校园'],
      createdAt: stamp,
      updatedAt: stamp,
    },
  ]

  const resumeFrontend = createResume(profile, {
    title: '前端开发，2027 届',
    targetRole: '前端开发工程师',
  })
  resumeFrontend.basics.headline = '前端开发工程师，2027 届'
  resumeFrontend.template = 'minimal'
  resumeFrontend.accent = '#0b66e4'
  const addResumeItems = (resume, type, items) => {
    const section = resume.sections.find((s) => s.type === type)
    if (section) section.items = items
  }
  addResumeItems(resumeFrontend, 'projects', [projectToResumeItem(projects[0]), projectToResumeItem(projects[1])])
  addResumeItems(resumeFrontend, 'experiences', [
    experienceToResumeItem(experiences[0]),
    experienceToResumeItem(experiences[1]),
  ])
  addResumeItems(resumeFrontend, 'awards', awards.map(awardToResumeItem))

  const resumeProduct = createResume(profile, {
    title: '产品实习生，日常实习',
    targetRole: '产品经理实习生',
  })
  resumeProduct.basics.headline = '产品设计与前端实现，2027 届'
  resumeProduct.basics.summary =
    '计算机专业背景，兼具产品设计与前端实现能力。完成 20+ 位用户访谈，主导 3 个校园产品从需求定义到上线；能独立完成原型、数据看板与前端页面，让方案真正落地。'
  resumeProduct.template = 'modern'
  resumeProduct.accent = '#35507d'
  addResumeItems(resumeProduct, 'projects', [projectToResumeItem(projects[0]), projectToResumeItem(projects[2])])
  addResumeItems(resumeProduct, 'experiences', [
    experienceToResumeItem(experiences[0]),
    experienceToResumeItem(experiences[2]),
  ])
  addResumeItems(resumeProduct, 'awards', [awardToResumeItem(awards[0]), awardToResumeItem(awards[2])])
  for (const section of resumeProduct.sections) {
    if (section.type === 'skills') section.titleCustom = '能力与工具'
  }

  const created = nowISO()
  const resumes = [resumeFrontend, resumeProduct].map((resume) => ({ ...resume, createdAt: stamp, updatedAt: stamp }))

  const applications = [
    {
      id: 'app-bytedance',
      company: '字节跳动',
      role: '前端开发实习生',
      city: '北京',
      channel: '官网',
      appliedAt: '2026-08-20',
      status: 'interview',
      nextStep: '三面，技术终面',
      nextStepDate: '2026-11-28',
      resumeId: resumeFrontend.id,
      link: '',
      notes: '一面重点问了 Vue 响应式原理与性能优化，二面手写 Promise 调度器。',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'app-alibaba',
      company: '阿里巴巴',
      role: '产品经理实习生',
      city: '杭州',
      channel: '内推',
      appliedAt: '2026-10-08',
      status: 'written',
      nextStep: '在线笔试',
      nextStepDate: '2026-11-24',
      resumeId: resumeProduct.id,
      link: '',
      notes: '内推人反馈简历已通过，等待笔试链接。',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'app-tencent',
      company: '腾讯',
      role: '前端开发实习生',
      city: '深圳',
      channel: '校园招聘',
      appliedAt: '2026-09-12',
      status: 'applied',
      nextStep: '等待简历筛选',
      nextStepDate: '2026-11-30',
      resumeId: resumeFrontend.id,
      link: '',
      notes: '',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'app-netease',
      company: '网易',
      role: '前端开发实习生',
      city: '杭州',
      channel: '线下宣讲',
      appliedAt: '2026-10-15',
      status: 'offer',
      nextStep: '确认入职意向',
      nextStepDate: '2026-11-25',
      resumeId: resumeFrontend.id,
      link: '',
      notes: '日常实习，可转正。需要在周五前反馈入职时间。',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'app-xiaohongshu',
      company: '小红书',
      role: '产品运营实习生',
      city: '上海',
      channel: '招聘平台',
      appliedAt: '2026-09-28',
      status: 'rejected',
      nextStep: '',
      nextStepDate: '',
      resumeId: resumeProduct.id,
      link: '',
      notes: '岗位更偏内容运营，与产品方向不匹配。',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'app-meituan',
      company: '美团',
      role: '前端开发实习生',
      city: '北京',
      channel: '官网',
      appliedAt: '',
      status: 'wishlist',
      nextStep: '完善投递材料',
      nextStepDate: '2026-12-05',
      resumeId: '',
      link: '',
      notes: '关注岗位开放时间，准备针对到店业务定制一版简历。',
      createdAt: created,
      updatedAt: created,
    },
  ]

  return { profile, projects, awards, experiences, resumes, applications }
}
