import { ActorContextFactory } from "@/bootstrap/auth/actor-context-factory";
import { createFirebaseAdminAuth } from "@/bootstrap/auth/firebase-admin";
import { FirebaseAuthenticationAdapter } from "@/bootstrap/auth/firebase-authentication-adapter";
import { PostgresMembershipQueryAdapter } from "@/bootstrap/auth/postgres-membership-query-adapter";
import { readServerEnvironment } from "@/bootstrap/env/env";
import { createPostgresDatabase } from "@/bootstrap/persistence/postgres";
import {
  developmentLeaveEligibilityPolicy,
  developmentLeaveWorkCalendars,
} from "@/modules/leave/adapters/external-systems/development-leave-dependencies";
import {
  PostgresEmployeeLeaveProfileQueryAdapter,
  PostgresLeaveAccessQueryAdapter,
} from "@/modules/leave/adapters/external-systems/postgres-employee-leave-profile-query-adapter";
import { PostgresLeaveRequestRepository } from "@/modules/leave/adapters/repositories/postgres-leave-request-repository";
import { ApproveLeaveRequestUseCase } from "@/modules/leave/application/use-cases/approve-leave-request";
import { CancelLeaveRequestUseCase } from "@/modules/leave/application/use-cases/cancel-leave-request";
import { GetLeaveRequestDetailUseCase } from "@/modules/leave/application/use-cases/get-leave-request-detail";
import { RejectLeaveRequestUseCase } from "@/modules/leave/application/use-cases/reject-leave-request";
import { SearchLeaveRequestsUseCase } from "@/modules/leave/application/use-cases/search-leave-requests";
import { SubmitLeaveRequestUseCase } from "@/modules/leave/application/use-cases/submit-leave-request";
import { systemClock } from "@/shared/kernel/clock";

export function createLeaveApiRuntime() {
  const environment = readServerEnvironment();
  const persistence = createPostgresDatabase(environment);
  const repository = new PostgresLeaveRequestRepository(persistence.database);
  const employeeProfiles = new PostgresEmployeeLeaveProfileQueryAdapter(
    persistence.database,
  );
  const access = new PostgresLeaveAccessQueryAdapter(persistence.database);
  const authentication = new FirebaseAuthenticationAdapter(
    createFirebaseAdminAuth(environment),
    environment.firebase,
  );
  const actors = new ActorContextFactory(
    environment.appTenantId,
    new PostgresMembershipQueryAdapter(persistence.database),
  );
  const workCalendars =
    process.env.NODE_ENV === "production"
      ? {
          async getLeaveWorkCalendar() {
            return null;
          },
        }
      : developmentLeaveWorkCalendars;

  return {
    authentication,
    actors,
    submit: new SubmitLeaveRequestUseCase(
      repository,
      employeeProfiles,
      workCalendars,
      developmentLeaveEligibilityPolicy,
      systemClock,
      repository,
    ),
    approve: new ApproveLeaveRequestUseCase(
      repository,
      access,
      repository,
      systemClock,
    ),
    reject: new RejectLeaveRequestUseCase(
      repository,
      access,
      repository,
      systemClock,
    ),
    cancel: new CancelLeaveRequestUseCase(repository, repository, systemClock),
    getDetail: new GetLeaveRequestDetailUseCase(
      repository,
      access,
      systemClock,
    ),
    search: new SearchLeaveRequestsUseCase(repository, access, systemClock),
    close: persistence.close,
  };
}

export type LeaveApiRuntime = ReturnType<typeof createLeaveApiRuntime>;
