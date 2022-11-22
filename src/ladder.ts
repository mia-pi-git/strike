/**
 * Matchmaking handling.
 */
import type {User} from './user';

export const Ladder = new class {
    searches = {} as Record<string, {user: User, time: number}>;
    matchLoop = setInterval(() => {
        for (const k in this.searches) {
            
        }
    }, 10 * 1000);

    search(user: User) {
        if (this.searches[user.id]) {
            return user.send({
                type: 'error',
                message: "You're already searching for a match.",
            });
        }
        this.searches[user.id] = {user, time: Date.now()};
    }
}