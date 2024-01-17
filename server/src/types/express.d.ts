import express from 'express';

declare module 'express-serve-static-core' {
  interface Locals {
    userId?: number;
  }
}
