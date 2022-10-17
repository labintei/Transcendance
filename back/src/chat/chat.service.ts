import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async addUser(username: string, id: number)
  {
    // Temporary implementation for testing purposes
    const user = new User;
    user.username = username;
    // user.ft_login = "id_;

    console.log("Debug before", id, id * 1000);
    let users = await this.userRepository.find();
    console.log(users);

    // await this.userRepository.save(user);
    user.ft_login = "id_" + id * 1000; 
    await this.userRepository.insert(user);

    console.log("Debug after");
    users = await this.userRepository.find();
    console.log(users);

  }
}
