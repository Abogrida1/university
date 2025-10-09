import { supabase } from './supabase';
import { Material } from './types';

export interface CourseSchedule {
  id: string;
  code: string;
  title: string;
  titleAr: string;
  department: string;
  departmentAr: string;
  year: number;
  term: string;
  termAr: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const courseService = {
  // Get courses for specific department, year, and term
  async getCoursesByCriteria(
    department: string,
    year: number,
    term: 'FIRST' | 'SECOND'
  ): Promise<CourseSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('department', department)
        .eq('year', year)
        .eq('term', term)
        .order('code', { ascending: true });

      if (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }

      return data?.map(material => ({
        id: material.id,
        code: material.code,
        title: material.title,
        titleAr: material.title_ar,
        department: material.department,
        departmentAr: material.department_ar,
        year: material.year,
        term: material.term,
        termAr: material.term_ar,
        description: material.description,
        createdAt: material.created_at,
        updatedAt: material.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in getCoursesByCriteria:', error);
      return [];
    }
  },

  // Get all courses (for admin purposes)
  async getAllCourses(): Promise<CourseSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('department', { ascending: true })
        .order('year', { ascending: true })
        .order('term', { ascending: true })
        .order('code', { ascending: true });

      if (error) {
        console.error('Error fetching all courses:', error);
        throw error;
      }

      return data?.map(material => ({
        id: material.id,
        code: material.code,
        title: material.title,
        titleAr: material.title_ar,
        department: material.department,
        departmentAr: material.department_ar,
        year: material.year,
        term: material.term,
        termAr: material.term_ar,
        description: material.description,
        createdAt: material.created_at,
        updatedAt: material.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      return [];
    }
  },

  // Get courses grouped by department
  async getCoursesGroupedByDepartment(): Promise<{ [department: string]: CourseSchedule[] }> {
    try {
      const courses = await this.getAllCourses();
      const grouped: { [department: string]: CourseSchedule[] } = {};

      courses.forEach(course => {
        if (!grouped[course.department]) {
          grouped[course.department] = [];
        }
        grouped[course.department].push(course);
      });

      return grouped;
    } catch (error) {
      console.error('Error in getCoursesGroupedByDepartment:', error);
      return {};
    }
  }
};
