import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'users/users.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let canActivate = super.canActivate(context);

    if (canActivate instanceof Promise) {
      canActivate = await canActivate;
    } else if (this.isObservable(canActivate)) {
      canActivate = await this.lastValueFrom(canActivate);
    }

    if (canActivate) {
      const user = request.user;
      if (user && user.id) {
        await this.usersService.updateLastLogin(user.id);
      }
    }

    return canActivate as boolean;
  }

  private isObservable(obj: any): obj is { subscribe: Function } {
    return !!obj && typeof obj.subscribe === 'function';
  }

  private async lastValueFrom<T>(observable: any): Promise<T> {
    return await new Promise<T>((resolve, reject) => {
      let value: T;
      observable.subscribe({
        next: (v: T) => (value = v),
        error: reject,
        complete: () => resolve(value),
      });
    });
  }
}