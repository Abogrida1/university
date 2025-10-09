import { supabase } from './supabase';

export interface Message {
  id: string;
  type: 'contact' | 'join';
  first_name: string;
  email: string;
  subject?: string;
  message?: string;
  department?: string;
  year?: string;
  term?: string;
  whatsapp?: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  firstName: string;
  email: string;
  subject: string;
  message: string;
}

export interface JoinFormData {
  firstName: string;
  email: string;
  department: string;
  year: string;
  term: string;
  whatsapp: string;
}

class MessagesService {
  // إضافة رسالة جديدة
  async add(type: 'contact' | 'join', data: ContactFormData | JoinFormData): Promise<Message> {
    try {
      const messageData = {
        type,
        first_name: data.firstName,
        email: data.email,
        ...(type === 'contact' ? {
          subject: (data as ContactFormData).subject,
          message: (data as ContactFormData).message
        } : {
          department: (data as JoinFormData).department,
          year: (data as JoinFormData).year,
          term: (data as JoinFormData).term,
          whatsapp: (data as JoinFormData).whatsapp
        })
      };

      const { data: message, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('Error adding message:', error);
        throw new Error(`فشل في إضافة الرسالة: ${error.message}`);
      }

      return message;
    } catch (error) {
      console.error('Error in add method:', error);
      throw error;
    }
  }

  // جلب جميع الرسائل
  async getAll(): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        throw new Error(`فشل في جلب الرسائل: ${error.message}`);
      }

      return messages || [];
    } catch (error) {
      console.error('Error in getAll method:', error);
      throw error;
    }
  }

  // جلب الرسائل حسب النوع
  async getByType(type: 'contact' | 'join'): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages by type:', error);
        throw new Error(`فشل في جلب الرسائل: ${error.message}`);
      }

      return messages || [];
    } catch (error) {
      console.error('Error in getByType method:', error);
      throw error;
    }
  }

  // تحديث حالة الرسالة
  async updateStatus(id: string, status: 'new' | 'read' | 'replied' | 'closed'): Promise<Message> {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating message status:', error);
        throw new Error(`فشل في تحديث حالة الرسالة: ${error.message}`);
      }

      return message;
    } catch (error) {
      console.error('Error in updateStatus method:', error);
      throw error;
    }
  }

  // حذف رسالة
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting message:', error);
        throw new Error(`فشل في حذف الرسالة: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in delete method:', error);
      throw error;
    }
  }

  // جلب إحصائيات الرسائل
  async getStats(): Promise<{
    total: number;
    new: number;
    read: number;
    replied: number;
    closed: number;
    contact: number;
    join: number;
  }> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('type, status');

      if (error) {
        console.error('Error fetching message stats:', error);
        throw new Error(`فشل في جلب إحصائيات الرسائل: ${error.message}`);
      }

      const stats = {
        total: messages?.length || 0,
        new: messages?.filter(m => m.status === 'new').length || 0,
        read: messages?.filter(m => m.status === 'read').length || 0,
        replied: messages?.filter(m => m.status === 'replied').length || 0,
        closed: messages?.filter(m => m.status === 'closed').length || 0,
        contact: messages?.filter(m => m.type === 'contact').length || 0,
        join: messages?.filter(m => m.type === 'join').length || 0,
      };

      return stats;
    } catch (error) {
      console.error('Error in getStats method:', error);
      throw error;
    }
  }
}

export const messagesService = new MessagesService();
