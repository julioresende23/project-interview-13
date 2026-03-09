import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { join } from 'path';
import request from 'supertest';
import { AppModule } from '../../../api-golden-raspberry/src/app/app.module';

describe('Prize intervals (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const csvPath =
      process.env['MOVIE_LIST_CSV'] ||
      join(process.cwd(), 'data', 'Movielist.csv');
    process.env['MOVIE_LIST_CSV'] = csvPath;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const requiredFields = [
    'producer',
    'interval',
    'previousWin',
    'followingWin',
  ] as const;

  it('GET /api/prize-intervals returns min and max according to proposal data', async () => {
    // Arrange
    const expectedMin = [
      {
        producer: 'Joel Silver',
        interval: 1,
        previousWin: 1990,
        followingWin: 1991,
      },
    ];
    const expectedMax = [
      {
        producer: 'Matthew Vaughn',
        interval: 13,
        previousWin: 2002,
        followingWin: 2015,
      },
    ];

    // Act
    const response = await request(app.getHttpServer()).get(
      '/api/prize-intervals'
    );

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('min');
    expect(response.body).toHaveProperty('max');
    expect(response.body.min).toEqual(expectedMin);
    expect(response.body.max).toEqual(expectedMax);
  });

  it('GET /api/prize-intervals returns min and max items with required schema (producer, interval, previousWin, followingWin)', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/prize-intervals'
    );
    expect(response.status).toBe(200);

    for (const entry of response.body.min) {
      for (const field of requiredFields) {
        expect(entry).toHaveProperty(field);
      }
      expect(Object.keys(entry).sort()).toEqual([...requiredFields].sort());
    }
    for (const entry of response.body.max) {
      for (const field of requiredFields) {
        expect(entry).toHaveProperty(field);
      }
      expect(Object.keys(entry).sort()).toEqual([...requiredFields].sort());
    }
  });

  it('GET /api/prize-intervals returns entries with correct field types', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/prize-intervals'
    );
    expect(response.status).toBe(200);
    for (const entry of [...response.body.min, ...response.body.max]) {
      expect(typeof entry.producer).toBe('string');
      expect(typeof entry.interval).toBe('number');
      expect(typeof entry.previousWin).toBe('number');
      expect(typeof entry.followingWin).toBe('number');
    }
  });

  it('GET /api/prize-intervals returns entries where followingWin - previousWin === interval', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/prize-intervals'
    );
    expect(response.status).toBe(200);
    for (const entry of [...response.body.min, ...response.body.max]) {
      expect(entry.followingWin - entry.previousWin).toBe(entry.interval);
    }
  });

  it('GET /api/prize-intervals responds with Content-Type application/json', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/prize-intervals'
    );
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /api/rota-inexistente returns 404', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/rota-inexistente'
    );
    expect(response.status).toBe(404);
  });

  it('POST /api/prize-intervals is not allowed (404 or 405)', async () => {
    const response = await request(app.getHttpServer()).post(
      '/api/prize-intervals'
    );
    expect([404, 405]).toContain(response.status);
  });

  it('GET /api/prize-intervals returns min and max ordered by producer then previousWin', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/prize-intervals'
    );
    expect(response.status).toBe(200);
    const sortedMin = [...response.body.min].sort(
      (a: { producer: string; previousWin: number }, b: { producer: string; previousWin: number }) =>
        a.producer.localeCompare(b.producer) || a.previousWin - b.previousWin
    );
    expect(response.body.min).toEqual(sortedMin);
    const sortedMax = [...response.body.max].sort(
      (a: { producer: string; previousWin: number }, b: { producer: string; previousWin: number }) =>
        a.producer.localeCompare(b.producer) || a.previousWin - b.previousWin
    );
    expect(response.body.max).toEqual(sortedMax);
  });
});
