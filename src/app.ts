import * as express from 'express'
import {Request, Response } from 'express'
import * as cors from 'cors'
import * as amqp from 'amqplib'
import { createConnection } from 'typeorm';
import { Product } from './entity/product';
import "reflect-metadata";

createConnection().then(async (db) => {
  const productRespository = db.getRepository(Product)

  try {
    const connection = await amqp.connect('amqps://lkgdchtg:QC6oAndiH8qjdCd3FOV-mAAW47y4fvLm@fox.rmq.cloudamqp.com/lkgdchtg');
    const channel = await connection.createChannel();
    const app = express()
    
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
    }))
    
    app.use(express.json())
    
    app.get('/api/products', async (req: Request, res: Response) => {
      const products = await productRespository.find()
      res.status(200).json(products)
    })
    
    app.post('/api/products', async (req: Request, res: Response) => {
      const product = productRespository.create(req.body)
      const result = await productRespository.save(product)
      channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))
      res.status(201).json(result)
    })
  
    app.get('/api/products/:id', async (req: Request, res: Response) => {
      const product = await productRespository.findOne(req.params.id);
      if(!product) {
        res.status(404).send("Product not found")
      }
      res.status(200).json(product)
    })
  
    app.put('/api/products/:id', async (req: Request, res: Response) => {
  
      const product = await productRespository.findOne(req.params.id)
      if(!product) {
        res.status(404).send("Product not found")
      }
      productRespository.merge(product, req.body);
      const result =  await productRespository.save(product)
      channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)))
      res.status(200).json(result)
    })
  
    app.delete('/api/products/:id', async(req: Request, res: Response) => {
      const result = await productRespository.delete(req.params.id)
      channel.sendToQueue('product_deleted', Buffer.from(JSON.stringify(req.params.id)))
      res.status(200).send("ok")
    })
  
    app.patch('/api/products/:id/like', async(req: Request, res:Response) => {
      const product = await productRespository.findOne(req.params.id)
      if(!product) {
        res.status(404).send("Product not found")
      }
      product.likes = product.likes + 1
      const result = await productRespository.save(product)
      res.status(200).json(result)
    })
    app.listen(8000, () => console.log('Server started at localhost:8000'))
    
    process.on('beforeExit', () => {
      console.log('closing')
      connection.close()
    })
  } catch (error) {
    throw error
  }
})