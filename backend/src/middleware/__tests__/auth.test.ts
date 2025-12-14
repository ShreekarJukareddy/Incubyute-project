import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorizeAdmin, AuthRequest } from '../auth';

describe('Authentication Middleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', async () => {
      const token = jwt.sign(
        { id: '123', email: 'test@example.com', role: 'user' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      mockRequest.header = jest.fn().mockReturnValue(`Bearer ${token}`);

      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe('123');
      expect(mockRequest.user?.email).toBe('test@example.com');
      expect(mockRequest.user?.role).toBe('user');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should fail authentication without token', async () => {
      mockRequest.header = jest.fn().mockReturnValue(undefined);

      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail authentication with invalid token', async () => {
      mockRequest.header = jest.fn().mockReturnValue('Bearer invalid-token');

      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail authentication with expired token', async () => {
      const token = jwt.sign(
        { id: '123', email: 'test@example.com', role: 'user' },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );

      mockRequest.header = jest.fn().mockReturnValue(`Bearer ${token}`);

      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authorizeAdmin', () => {
    it('should allow admin user to proceed', async () => {
      mockRequest.user = {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      };

      await authorizeAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny non-admin user', async () => {
      mockRequest.user = {
        id: '123',
        email: 'user@example.com',
        role: 'user',
      };

      await authorizeAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Admin access required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny when user is not set', async () => {
      mockRequest.user = undefined;

      await authorizeAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Admin access required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
