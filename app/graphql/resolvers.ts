import { Arg, Ctx, Field, ID, ObjectType, Query, Resolver } from 'type-graphql';
import { getTodayForDisplay } from '../utils/dateUtils';
import { FlightRadarService } from '../services/flightRadarService';
import db from '../database';
import { TechStatusData } from '../database/models';

// 定义飞机对象类型
@ObjectType()
export class Aircraft {
  @Field(() => ID)
  id!: string;

  @Field()
  registration!: string;

  @Field()
  msn!: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  airline?: string;

  @Field({ nullable: true })
  operator?: string;

  @Field({ nullable: true })
  serialNumber?: string;

  @Field({ nullable: true })
  age?: string;

  constructor(
    id: string,
    registration: string,
    msn: string,
    type?: string,
    airline?: string,
    operator?: string,
    serialNumber?: string,
    age?: string
  ) {
    this.id = id;
    this.registration = registration;
    this.msn = msn;
    this.type = type;
    this.airline = airline;
    this.operator = operator;
    this.serialNumber = serialNumber;
    this.age = age;
  }
}

// 定义飞行历史记录对象类型
@ObjectType()
export class FlightHistory {
  @Field(() => ID)
  id!: string;

  @Field()
  date!: string;

  @Field()
  fromAirport!: string;

  @Field()
  fromCode!: string;

  @Field()
  toAirport!: string;

  @Field()
  toCode!: string;

  @Field()
  flightNumber!: string;

  @Field()
  flightTime!: string;

  @Field()
  scheduledDeparture!: string;

  @Field()
  actualDeparture!: string;

  @Field()
  scheduledArrival!: string;

  @Field()
  status!: string;

  constructor(
    id: string,
    date: string,
    fromAirport: string,
    fromCode: string,
    toAirport: string,
    toCode: string,
    flightNumber: string,
    flightTime: string,
    scheduledDeparture: string,
    actualDeparture: string,
    scheduledArrival: string,
    status: string
  ) {
    this.id = id;
    this.date = date;
    this.fromAirport = fromAirport;
    this.fromCode = fromCode;
    this.toAirport = toAirport;
    this.toCode = toCode;
    this.flightNumber = flightNumber;
    this.flightTime = flightTime;
    this.scheduledDeparture = scheduledDeparture;
    this.actualDeparture = actualDeparture;
    this.scheduledArrival = scheduledArrival;
    this.status = status;
  }
}

// 定义飞机故障对象类型
@ObjectType()
export class AircraftFailure {
  @Field(() => ID)
  id!: string;

  @Field()
  severity!: string;
  
  @Field()
  date_reported!: string;
  
  @Field()
  registration!: string;

  @Field()
  msn!: string;
  
  @Field()
  ata!: string;
  
  @Field()
  failure_description!: string;
  
  @Field()
  resolution_measures!: string;
  
  @Field()
  is_aog!: boolean;
  
  @Field()
  is_sdr!: boolean;
  
  @Field()
  operation_impact!: string;
  
  @Field()
  is_396!: boolean;
  
  @Field({ nullable: true })
  notes?: string;

  constructor(
    id: string,
    severity: string,
    date_reported: string,
    registration: string,
    msn: string,
    ata: string,
    failure_description: string,
    resolution_measures: string,
    is_aog: boolean,
    is_sdr: boolean,
    operation_impact: string,
    is_396: boolean,
    notes?: string
  ) {
    this.id = id;
    this.severity = severity;
    this.date_reported = date_reported;
    this.registration = registration;
    this.msn = msn;
    this.ata = ata;
    this.failure_description = failure_description;
    this.resolution_measures = resolution_measures;
    this.is_aog = is_aog;
    this.is_sdr = is_sdr;
    this.operation_impact = operation_impact;
    this.is_396 = is_396;
    this.notes = notes;
  }
}

// 模拟数据
const mockAircraft: Aircraft[] = [
  new Aircraft(
    '1', 
    'B-652G', 
    'ARJ21-700',
    'Comac ARJ-21-700(ER)',
    'VietJet Air (75 Years VNM-CHN Relations Livery)',
    'Chengdu Airlines',
    'N/A',
    'N/A'
  ),
  new Aircraft(
    '2', 
    'B-656E', 
    'ARJ21-700',
    'Comac ARJ-21-700(ER)',
    'VietJet Air (75 Years VNM-CHN Relations Livery)',
    'Chengdu Airlines',
    'N/A',
    'N/A'
  ),
  new Aircraft('3', 'B-123A', 'A320'),
  new Aircraft('4', 'B-456B', 'B737'),
  new Aircraft('5', 'B-789C', 'A330'),
  new Aircraft('6', 'B-012D', 'B787'),
];

// 模拟飞行历史数据
const mockFlightHistories: { [key: string]: FlightHistory[] } = {
  'B-652G': [
    new FlightHistory(
      '1',
      getTodayForDisplay(),
      'Con Dao',
      'VCS',
      'Hanoi',
      'HAN',
      'VJ102',
      '2:03',
      '04:35',
      '05:08',
      '06:50',
      'Landed 07:12'
    ),
    new FlightHistory(
      '2',
      getTodayForDisplay(),
      'Ho Chi Minh City',
      'SGN',
      'Con Dao',
      'VCS',
      'VJ115',
      '0:40',
      '03:30',
      '03:58',
      '04:10',
      'Landed 04:38'
    ),
    new FlightHistory(
      '3',
      getTodayForDisplay(),
      'Con Dao',
      'VCS',
      'Ho Chi Minh City',
      'SGN',
      'VJ114',
      '0:38',
      '02:20',
      '02:32',
      '03:05',
      'Landed 03:09'
    ),
    new FlightHistory(
      '4',
      '09 May 2025',
      'Hanoi',
      'HAN',
      'Con Dao',
      'VCS',
      'VJ101',
      '2:00',
      '23:45',
      '23:55',
      '01:55',
      'Landed 01:55'
    ),
    new FlightHistory(
      '5',
      '09 May 2025',
      'Con Dao',
      'VCS',
      'Hanoi',
      'HAN',
      'VJ102',
      '2:04',
      '04:35',
      '05:14',
      '06:50',
      'Landed 07:18'
    )
  ],
  'B-656E': [
    new FlightHistory(
      '1',
      getTodayForDisplay(),
      'Con Dao',
      'VCS',
      'Hanoi',
      'HAN',
      'VJ104',
      '2:01',
      '07:05',
      '07:30',
      '09:20',
      'Landed 09:32'
    ),
    new FlightHistory(
      '2',
      getTodayForDisplay(),
      'Ho Chi Minh City',
      'SGN',
      'Con Dao',
      'VCS',
      'VJ117',
      '0:33',
      '06:00',
      '06:30',
      '06:40',
      'Landed 07:04'
    ),
    new FlightHistory(
      '3',
      getTodayForDisplay(),
      'Con Dao',
      'VCS',
      'Ho Chi Minh City',
      'SGN',
      'VJ116',
      '0:40',
      '04:50',
      '05:02',
      '05:35',
      'Landed 05:42'
    ),
    new FlightHistory(
      '4',
      '09 May 2025',
      'Hanoi',
      'HAN',
      'Con Dao',
      'VCS',
      'VJ103',
      '1:59',
      '02:15',
      '02:27',
      '04:25',
      'Landed 04:25'
    ),
    new FlightHistory(
      '5',
      '09 May 2025',
      'Con Dao',
      'VCS',
      'Hanoi',
      'HAN',
      'VJ104',
      '2:04',
      '07:05',
      '07:45',
      '09:20',
      'Landed 09:49'
    )
  ]
};

// 解析器
@Resolver()
export class AircraftResolver {
  @Query(() => [Aircraft])
  async getAllAircraft(): Promise<Aircraft[]> {
    // 这里可以连接数据库获取真实数据
    // 目前返回模拟数据
    return mockAircraft;
  }

  @Query(() => Aircraft, { nullable: true })
  async getAircraftDetails(
    @Arg('registration') registration: string
  ): Promise<Aircraft | null> {
    // 查找符合注册号的飞机
    const aircraft = mockAircraft.find(
      a => a.registration.toLowerCase() === registration.toLowerCase()
    );
    
    return aircraft || null;
  }

  @Query(() => [FlightHistory])
  async getAircraftFlightHistory(
    @Arg('registration') registration: string
  ): Promise<FlightHistory[]> {
    console.log(`GraphQL: 获取飞机 ${registration} 的飞行历史数据`);
    
    // 获取模拟数据
    const modelData = await FlightRadarService.fetchFlightHistory(registration);
    
    // 转换为GraphQL类型
    return modelData.map(flight => new FlightHistory(
      flight.id,
      flight.date,
      flight.fromAirport,
      flight.fromCode,
      flight.toAirport,
      flight.toCode,
      flight.flightNumber,
      flight.flightTime,
      flight.scheduledDeparture,
      flight.actualDeparture,
      flight.scheduledArrival,
      flight.status
    ));
  }
}

@Resolver()
export class AircraftFailureResolver {
  @Query(() => [AircraftFailure])
  async getAllAircraftFailures(): Promise<AircraftFailure[]> {
    try {
      // 从数据库获取真实数据
      const techStatusData = await db.getTechStatusData();
      
      // 转换为GraphQL类型
      return techStatusData.map((data: TechStatusData, index) => {
        // 处理为null或undefined的情况
        const isAog = Boolean(data["是否AOG"]);
        const isSdr = Boolean(data["是否SDR"]);
        const is396 = Boolean(data["是否396"]);
        
        // 故障级别值：默认为1（轻微），如果是AOG则为2（严重）
        const severity = data["故障级别"] ? data["故障级别"].toString() : (isAog ? "2" : "1");
        
        return new AircraftFailure(
          // 如果有ID则使用，否则使用索引
          data.id || `${index}`,
          // 使用故障级别值
          severity,
          data["日期"] || "",
          data["注册号"] || "",
          data["MSN"] || "",
          data["ATA"] || "",
          data["故障描述"] || "",
          data["处置措施"] || "",
          isAog,
          isSdr,
          data["对运行的影响"] || "",
          is396,
          data["备注"] || ""
        );
      });
    } catch (error) {
      console.error("获取飞机故障数据失败:", error);
      return [];
    }
  }
} 