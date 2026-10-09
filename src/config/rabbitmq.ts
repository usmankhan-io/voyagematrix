import amqplib, { Channel, Connection } from 'amqplib';
import { env } from './env';

export const EXCHANGE_NAME = 'booking_exchange';
export const BOOKING_CONFIRMED_QUEUE = 'booking.confirmed';
export const BOOKING_ROUTING_KEY = 'booking.confirmed';

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(): Promise<void> {
  connection = await amqplib.connect(env.RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
  await channel.assertQueue(BOOKING_CONFIRMED_QUEUE, { durable: true });
  await channel.bindQueue(BOOKING_CONFIRMED_QUEUE, EXCHANGE_NAME, BOOKING_ROUTING_KEY);

  console.log('RabbitMQ connected');
}

export function getChannel(): Channel {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  return channel;
}

export async function publishMessage(routingKey: string, payload: unknown): Promise<void> {
  const ch = getChannel();
  ch.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true },
  );
}

export async function disconnectRabbitMQ(): Promise<void> {
  await channel?.close();
  await connection?.close();
  console.log('RabbitMQ disconnected');
}
