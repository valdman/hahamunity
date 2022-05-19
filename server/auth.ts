import {Request, RequestHandler} from 'express';
import passport, {Strategy} from 'passport';

import {User, UserModel} from '~/entities/user';

class TokenStrategy extends Strategy {
    public name = '';

    private _verify: TokenStrategyVerifyFunction;
    private _realm = 'Users';
    private _options: TokenStrategyOptions;

    constructor(
        options: TokenStrategyOptions,
        verify: TokenStrategyVerifyFunction
    ) {
        super();
        if (!verify)
            throw new Error(
                'HTTP Basic authentication strategy requires a verify function'
            );

        this._verify = verify;
        this._options = options;
        this.name = this._options.isAdminOnly ? 'admin-token' : 'user-token';
    }

    authenticate(req: Request) {
        const tokens = req.headers['token'] || '';
        const tokenHeader = Array.isArray(tokens) ? tokens[0] : tokens;
        if (!tokenHeader) {
            return this.fail('No token header', 403);
        }

        const token = tokenHeader.toString();

        if (!token) {
            return this.fail('No auth token found', 403);
        }

        const {error, fail, success, _options} = this;

        function verified(err: unknown, user?: User | false) {
            if (err) {
                return error(err);
            }
            if (!user) {
                return fail('Token auth failed', 403);
            }
            if(_options.isAdminOnly && !user?.isAdmin) {
                return fail('User is not an admin', 403);
            }
            success(user);
        }

        this._verify(token, verified);
    }

    _challenge() {
        return 'Basic realm="' + this._realm + '"';
    }
}

interface TokenStrategyVerifyFunction {
  (
    token: string,
    done: (error?: Error | null, user?: User | false) => void
  ): void;
}

interface TokenStrategyOptions {
  isAdminOnly: boolean;
}

function verifyUserExists(
    token: string,
    done: (err?: Error | null, user?: User | false) => void
) {
    UserModel.findOne({token}, function (err: Error, user: User) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    });
}
const userStrategy = new TokenStrategy({isAdminOnly: false}, function (
    token,
    done
) {
    verifyUserExists(token, done);
});

const adminStrategy = new TokenStrategy({isAdminOnly: true}, function (
    token,
    done
) {
    verifyUserExists(token, done);
});

passport.use(userStrategy);
passport.use(adminStrategy);
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user: User, done) {
    done(null, user);
});

export const deAuthHandler: RequestHandler = async function deauthentificate(
    req,
    res
) {
    req.logout();
    res.redirect('/');
};

export function connectAuth(
    authHandler: RequestHandler,
    requestHandler: RequestHandler
): RequestHandler {
    return async (req, res, next) => {
        function authNext() {
            requestHandler(req, res, next);
        }
        return authHandler(req, res, authNext);
    };
}

export const authRequiredFilter: RequestHandler =
  passport.authenticate(userStrategy);
export const authAdminRequiredFilter: RequestHandler =
  passport.authenticate(adminStrategy);
