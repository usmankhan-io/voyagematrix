import dotenv from 'dotenv';
dotenv.config();

import amqplib from 'amqplib';
import { env } from '../config/env';
import { BookingConfirmedEvent } from '../types';

const EXCHANGE_NAME = 'booking_exchange';
const QUEUE_NAME = 'booking.confirmed';
const ROUTING_KEY = 'booking.confirmed';

async function startConsumer(): Promise<void> {
  console.log('Starting booking confirmation worker...');

  const connection = await amqplib.connect(env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

  channel.prefetch(1);

  console.log(`Listening on queue: ${QUEUE_NAME}`);

  channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString()) as BookingConfirmedEvent;

      console.log('\n--- Booking Confirmation Event ---');
      console.log(`Booking ID : ${event.bookingId}`);
      console.log(`User Email : ${event.userEmail}`);
      console.log(`Type       : ${event.type}`);
      console.log(`Total Price: $${event.totalPrice.toFixed(2)}`);
      console.log(`Timestamp  : ${event.timestamp}`);
      console.log('---------------------------------');

      // Simulate sending a confirmation email
      simulateSendEmail(event);

      channel.ack(msg);
    } catch (err) {
      console.error('Failed to process message:', err);
      channel.nack(msg, false, false); // dead-letter without requeue
    }
  });

  process.on('SIGINT', async () => {
    console.log('\nShutting down worker...');
    await channel.close();
    await connection.close();
    process.exit(0);
  });
}

function simulateSendEmail(event: BookingConfirmedEvent): void {
  console.log(`[EMAIL SIMULATION] Sending confirmation to ${event.userEmail}`);
  console.log(`  Subject: Your ${event.type} booking is confirmed!`);
  console.log(`  Body: Booking #${event.bookingId} totalling $${event.totalPrice.toFixed(2)} confirmed.`);
}

startConsumer().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
