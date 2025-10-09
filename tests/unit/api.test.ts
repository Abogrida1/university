import { getCourses, getDepartments, searchCourses } from '@/lib/api';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

describe('API Functions', () => {
  test('getDepartments should return departments array', async () => {
    const mockDepartments = [
      { id: '1', name: 'علوم الحاسوب', programs: ['عام', 'AI'] }
    ];
    
    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValue({
      docs: mockDepartments.map(dept => ({
        id: dept.id,
        data: () => dept
      }))
    });

    const result = await getDepartments();
    expect(result).toEqual(mockDepartments);
  });

  test('getCourses should return courses array', async () => {
    const mockCourses = [
      {
        id: '1',
        code: 'CS101',
        title: 'مقدمة في البرمجة',
        departmentId: '1',
        program: 'عام',
        year: 1,
        term: 1,
        description: 'مقدمة في أساسيات البرمجة',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValue({
      docs: mockCourses.map(course => ({
        id: course.id,
        data: () => course
      }))
    });

    const result = await getCourses({});
    expect(result).toEqual(mockCourses);
  });

  test('searchCourses should filter courses by query', async () => {
    const mockCourses = [
      {
        id: '1',
        code: 'CS101',
        title: 'مقدمة في البرمجة',
        description: 'مقدمة في أساسيات البرمجة'
      },
      {
        id: '2',
        code: 'AI201',
        title: 'الذكاء الاصطناعي',
        description: 'مفاهيم الذكاء الاصطناعي'
      }
    ];

    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValue({
      docs: mockCourses.map(course => ({
        id: course.id,
        data: () => course
      }))
    });

    const result = await searchCourses('برمجة');
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('برمجة');
  });
});
